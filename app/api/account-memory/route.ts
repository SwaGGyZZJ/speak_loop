import { mkdir, readFile, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

type Account = {
  id: string;
  email: string;
  provider: "email";
  createdAt: string;
};

type Database = {
  accounts: Account[];
  sessions: Record<string, string>;
  profiles: Record<string, unknown>;
  histories: Record<string, unknown[]>;
  memories: Record<string, unknown>;
  memoryEvents: MemoryEvent[];
};

const dbPath = path.join(process.cwd(), "data", "account-memory-db.json");
const sensitivePatterns = [/password/i, /passport/i, /id card/i, /身份证/, /银行卡/, /住址/, /address/i, /salary/i, /薪资/];

type MemoryEvent = {
  id: string;
  userId: string;
  eventType: "created" | "updated" | "cleared" | "deleted" | "rebuilt";
  sourceSessionId: string | null;
  reason: string;
  createdAt: string;
};

type StoredSession = {
  id?: string;
  taskId?: string;
  taskTitle?: string;
  categoryLabel?: string;
  role?: string;
  expressions?: string[];
  transcript?: { role: string; text: string }[];
  assessment?: {
    scoreRange?: string;
    completionSummary?: string;
    clarity?: string;
    naturalness?: string;
    professionalTone?: string;
    interaction?: string;
    taskCompletion?: string;
    repeatSentences?: string[];
  };
  createdAt?: string;
};

type UserMemory = {
  summary: string;
  recurringWeaknesses: { label: string; evidence: string; count: number; lastSeen: string; sourceSessionId: string | null }[];
  strengths: string[];
  recommendedTaskId: string;
  recommendedReason: string;
  savedPhrases: { phrase: string; usage: string; sourceSessionId: string | null }[];
  lastPracticeAt: string;
};

function makeUserId(email: string) {
  return `usr_${email.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`;
}

async function readDb(): Promise<Database> {
  try {
    const db = JSON.parse(await readFile(dbPath, "utf8")) as Partial<Database>;
    return {
      accounts: db.accounts ?? [],
      sessions: db.sessions ?? {},
      profiles: db.profiles ?? {},
      histories: db.histories ?? {},
      memories: db.memories ?? {},
      memoryEvents: db.memoryEvents ?? []
    };
  } catch {
    return { accounts: [], sessions: {}, profiles: {}, histories: {}, memories: {}, memoryEvents: [] };
  }
}

async function writeDb(db: Database) {
  await mkdir(path.dirname(dbPath), { recursive: true });
  await writeFile(dbPath, JSON.stringify(db, null, 2));
}

function publicState(db: Database, account: Account) {
  return {
    account,
    profile: db.profiles[account.id] ?? null,
    history: db.histories[account.id] ?? [],
    memory: db.memories[account.id] ?? null,
    memoryEvents: db.memoryEvents.filter((event) => event.userId === account.id).slice(-20)
  };
}

function sanitizeText(value: unknown, fallback = "") {
  const text = String(value ?? fallback).slice(0, 320);
  if (sensitivePatterns.some((pattern) => pattern.test(text))) return "";
  return text;
}

function addMemoryEvent(db: Database, event: Omit<MemoryEvent, "id" | "createdAt">) {
  db.memoryEvents.push({
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...event
  });
}

function buildServerMemory(userId: string, sessions: StoredSession[], previous?: UserMemory | null): UserMemory | null {
  const validSessions = sessions.filter((session) => session?.id && session.assessment);
  if (!validSessions.length) return null;
  const latest = validSessions[0];
  const latestAssessment = latest.assessment ?? {};
  const latestUserAnswer =
    latest.transcript
      ?.filter((line) => line.role === "user")
      .map((line) => sanitizeText(line.text))
      .filter(Boolean)
      .at(-1) ?? "";
  const taskCompletion = sanitizeText(latestAssessment.taskCompletion ?? latestAssessment.completionSummary);
  const weaknessLabel =
    /next step|owner|deadline|下一步|负责人|时间/.test(taskCompletion)
      ? "missing concrete next step"
      : latest.categoryLabel === "需求确认"
        ? "needs clearer clarification"
        : "needs more structured workplace answer";
  const previousWeakness = previous?.recurringWeaknesses?.find((item) => item.label === weaknessLabel);
  const recurringWeaknesses = [
    {
      label: weaknessLabel,
      evidence: taskCompletion || "Recent report identified a recurring workplace communication issue.",
      count: (previousWeakness?.count ?? 0) + 1,
      lastSeen: new Date().toISOString(),
      sourceSessionId: latest.id ?? null
    },
    ...(previous?.recurringWeaknesses ?? []).filter((item) => item.label !== weaknessLabel && validSessions.some((session) => session.id === item.sourceSessionId))
  ].slice(0, 3);
  const recommendedTaskId = weaknessLabel === "needs clearer clarification" ? "requirements-restate-ambiguous-request" : "update-delay-plan";
  const selectedPhrases = (latest.expressions ?? []).slice(0, 2).map((phrase) => ({
    phrase: sanitizeText(phrase, "workplace phrase"),
    usage: `Useful after practicing ${sanitizeText(latest.taskTitle, "this task")}`,
    sourceSessionId: latest.id ?? null
  }));
  const savedPhrases = [...selectedPhrases, ...(previous?.savedPhrases ?? []).filter((item) => validSessions.some((session) => session.id === item.sourceSessionId))]
    .filter((item) => item.phrase)
    .filter((item, index, list) => list.findIndex((candidate) => candidate.phrase === item.phrase) === index)
    .slice(0, 6);

  return {
    summary:
      sanitizeText(
        `User practiced ${latest.categoryLabel ?? "workplace speaking"}: ${latest.taskTitle ?? "workplace task"}. Latest evidence: "${latestUserAnswer}". Main coaching focus: ${weaknessLabel}.`
      ) || `User has workplace speaking history. Main coaching focus: ${weaknessLabel}.`,
    recurringWeaknesses,
    strengths: [
      latestAssessment.clarity ? "can complete a workplace role-play with report feedback" : "completed workplace role-play",
      ...(previous?.strengths ?? [])
    ].slice(0, 3),
    recommendedTaskId,
    recommendedReason:
      weaknessLabel === "needs clearer clarification"
        ? "Practice turning vague requests into concrete acceptance criteria."
        : "Practice turning workplace problems into owner, deadline, and recovery plan.",
    savedPhrases,
    lastPracticeAt: new Date().toISOString()
  };
}

function rebuildMemory(db: Database, userId: string, reason: string, sourceSessionId: string | null) {
  const previous = (db.memories[userId] as UserMemory | undefined) ?? null;
  const nextMemory = buildServerMemory(userId, (db.histories[userId] ?? []) as StoredSession[], previous);
  if (nextMemory) {
    db.memories[userId] = nextMemory;
    addMemoryEvent(db, { userId, eventType: reason === "new session assessment" ? (previous ? "updated" : "created") : "rebuilt", sourceSessionId, reason });
  } else {
    delete db.memories[userId];
    addMemoryEvent(db, { userId, eventType: "deleted", sourceSessionId, reason });
  }
}

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

async function supabaseRequest<T>(pathName: string, init: RequestInit = {}, accessToken?: string): Promise<T> {
  const config = supabaseConfig();
  if (!config) throw new Error("supabase_not_configured");
  const response = await fetch(`${config.url}${pathName}`, {
    ...init,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${accessToken ?? config.serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`supabase_request_failed:${response.status}:${detail.slice(0, 240)}`);
  }
  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}

function restPath(table: string, query = "") {
  return `/rest/v1/${table}${query ? `?${query}` : ""}`;
}

function eq(column: string, value: string) {
  return `${column}=eq.${encodeURIComponent(value)}`;
}

function andEq(filters: Record<string, string>) {
  return Object.entries(filters)
    .map(([column, value]) => eq(column, value))
    .join("&");
}

type CloudUserRow = {
  id: string;
  email: string;
  provider: "email";
  created_at: string;
};

type SupabaseAuthUser = {
  id: string;
  email?: string;
};

type CloudSessionRow = {
  id: string;
  user_id: string;
  task_id: string;
  task_title: string | null;
  category_label: string | null;
  role: string | null;
  expressions: string[];
  transcript: { role: string; text: string }[];
  score_range: string | null;
  repeat_sentences: string[];
  created_at: string;
};

type CloudReportRow = {
  session_id: string;
  report: StoredSession["assessment"];
};

function toAccount(row: CloudUserRow): Account {
  return { id: row.id, email: row.email, provider: "email", createdAt: row.created_at };
}

async function cloudFindAccountByEmail(email: string) {
  const rows = await supabaseRequest<CloudUserRow[]>(
    restPath("app_users", `select=*&${eq("email", email.toLowerCase())}&limit=1`)
  );
  return rows[0] ? toAccount(rows[0]) : null;
}

async function cloudFindAccountById(userId: string) {
  const rows = await supabaseRequest<CloudUserRow[]>(restPath("app_users", `select=*&${eq("id", userId)}&limit=1`));
  return rows[0] ? toAccount(rows[0]) : null;
}

async function cloudGetAuthUser(accessToken: string) {
  const user = await supabaseRequest<SupabaseAuthUser>("/auth/v1/user", {}, accessToken);
  return user?.id ? user : null;
}

async function cloudCreateAccount(email: string, id?: string) {
  const rows = await supabaseRequest<CloudUserRow[]>(restPath("app_users"), {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ id, email: email.toLowerCase(), provider: "email" })
  });
  return toAccount(rows[0]);
}

async function cloudAuthenticate(userId: string, sessionToken: string, accessToken?: string) {
  if (accessToken) {
    try {
      const authUser = await cloudGetAuthUser(accessToken);
      if (authUser?.id === userId) return true;
    } catch {
      return false;
    }
  }
  const rows = await supabaseRequest<{ token: string }[]>(
    restPath("app_sessions", `select=token&${eq("token", sessionToken)}&${eq("user_id", userId)}&limit=1`)
  );
  return rows.length > 0;
}

async function cloudAddMemoryEvent(event: Omit<MemoryEvent, "id" | "createdAt">) {
  await supabaseRequest(restPath("memory_events"), {
    method: "POST",
    body: JSON.stringify({
      user_id: event.userId,
      event_type: event.eventType,
      source_session_id: event.sourceSessionId,
      reason: event.reason
    })
  });
}

async function cloudGetHistory(userId: string) {
  const [sessionRows, reportRows] = await Promise.all([
    supabaseRequest<CloudSessionRow[]>(
      restPath("practice_sessions", `select=*&${eq("user_id", userId)}&order=created_at.desc&limit=50`)
    ),
    supabaseRequest<CloudReportRow[]>(restPath("assessment_reports", `select=session_id,report&${eq("user_id", userId)}`))
  ]);
  const reports = new Map(reportRows.map((row) => [row.session_id, row.report]));
  return sessionRows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    taskId: row.task_id,
    taskTitle: row.task_title ?? "",
    categoryLabel: row.category_label ?? "",
    role: row.role ?? "",
    expressions: row.expressions ?? [],
    transcript: row.transcript ?? [],
    assessment: reports.get(row.id) ?? {},
    scoreRange: row.score_range ?? "",
    repeatSentences: row.repeat_sentences ?? [],
    createdAt: row.created_at
  }));
}

async function cloudGetMemory(userId: string) {
  const rows = await supabaseRequest<{ memory: UserMemory }[]>(restPath("user_memory", `select=memory&${eq("user_id", userId)}&limit=1`));
  return rows[0]?.memory ?? null;
}

async function cloudSessionOwner(sessionId: string) {
  const rows = await supabaseRequest<{ user_id: string }[]>(restPath("practice_sessions", `select=user_id&${eq("id", sessionId)}&limit=1`));
  return rows[0]?.user_id ?? null;
}

async function cloudPublicState(account: Account) {
  const [profileRows, history, memory, memoryEvents] = await Promise.all([
    supabaseRequest<{ profile: unknown }[]>(restPath("user_profiles", `select=profile&${eq("user_id", account.id)}&limit=1`)),
    cloudGetHistory(account.id),
    cloudGetMemory(account.id),
    supabaseRequest<{ id: string; event_type: MemoryEvent["eventType"]; source_session_id: string | null; reason: string; created_at: string }[]>(
      restPath("memory_events", `select=*&${eq("user_id", account.id)}&order=created_at.desc&limit=20`)
    )
  ]);
  return {
    account,
    profile: profileRows[0]?.profile ?? null,
    history,
    memory,
    memoryEvents: memoryEvents
      .map((event) => ({
        id: event.id,
        userId: account.id,
        eventType: event.event_type,
        sourceSessionId: event.source_session_id,
        reason: event.reason,
        createdAt: event.created_at
      }))
      .reverse()
  };
}

async function cloudUpsertMemory(userId: string, memory: UserMemory) {
  await supabaseRequest(restPath("user_memory", "on_conflict=user_id"), {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ user_id: userId, memory, updated_at: new Date().toISOString() })
  });
  await Promise.all(
    memory.savedPhrases.map((item) =>
      supabaseRequest(restPath("saved_phrases", "on_conflict=user_id,phrase"), {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({
          user_id: userId,
          phrase: item.phrase,
          usage: item.usage,
          source_session_id: item.sourceSessionId
        })
      })
    )
  );
}

async function cloudRebuildMemory(userId: string, reason: string, sourceSessionId: string | null) {
  const previous = await cloudGetMemory(userId);
  const history = await cloudGetHistory(userId);
  const nextMemory = buildServerMemory(userId, history as StoredSession[], previous);
  if (nextMemory) {
    await cloudUpsertMemory(userId, nextMemory);
    await cloudAddMemoryEvent({
      userId,
      eventType: reason === "new session assessment" ? (previous ? "updated" : "created") : "rebuilt",
      sourceSessionId,
      reason
    });
  } else {
    await supabaseRequest(restPath("user_memory", eq("user_id", userId)), { method: "DELETE" });
    await cloudAddMemoryEvent({ userId, eventType: "deleted", sourceSessionId, reason });
  }
}

async function handleCloudAction(body: Record<string, unknown>) {
  const action = String(body.action ?? "");

  if (action === "login") {
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!email) return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 });
    const accessToken = String(body.supabaseAccessToken ?? "");
    if (!accessToken) return NextResponse.json({ ok: false, error: "supabase_access_token_required" }, { status: 401 });
    const authUser = await cloudGetAuthUser(accessToken);
    if (!authUser?.id) return NextResponse.json({ ok: false, error: "invalid_supabase_access_token" }, { status: 401 });
    if (authUser.email?.toLowerCase() !== email) {
      return NextResponse.json({ ok: false, error: "auth_email_mismatch" }, { status: 401 });
    }
    const account =
      (await cloudFindAccountById(authUser.id)) ??
      (await cloudCreateAccount(email, authUser.id));
    const sessionToken = randomUUID();
    await supabaseRequest(restPath("app_sessions"), {
      method: "POST",
      body: JSON.stringify({ token: sessionToken, user_id: account.id })
    });
    return NextResponse.json({ ok: true, sessionToken, storageMode: "supabase", ...(await cloudPublicState(account)) });
  }

  const userId = String(body.userId ?? "");
  const sessionToken = String(body.sessionToken ?? "");
  const accessToken = String(body.supabaseAccessToken ?? "");
  const account = await cloudFindAccountById(userId);
  if (!account || !(await cloudAuthenticate(userId, sessionToken, accessToken))) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  if (action === "getState") {
    return NextResponse.json({ ok: true, storageMode: "supabase", ...(await cloudPublicState(account)) });
  }

  if (action === "saveProfile") {
    await supabaseRequest(restPath("user_profiles", "on_conflict=user_id"), {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ user_id: userId, profile: body.profile ?? {}, updated_at: new Date().toISOString() })
    });
    return NextResponse.json({ ok: true, storageMode: "supabase", ...(await cloudPublicState(account)) });
  }

  if (action === "saveSession") {
    const session = body.session as StoredSession | undefined;
    if (!session?.id) return NextResponse.json({ ok: false, error: "session_required" }, { status: 400 });
    const existingOwner = await cloudSessionOwner(session.id);
    if (existingOwner && existingOwner !== userId) {
      return NextResponse.json({ ok: false, error: "session_id_conflict" }, { status: 409 });
    }
    await supabaseRequest(restPath("practice_sessions", "on_conflict=id"), {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({
        id: session.id,
        user_id: userId,
        task_id: session.taskId ?? "",
        task_title: session.taskTitle ?? "",
        category_label: session.categoryLabel ?? "",
        role: session.role ?? "",
        expressions: session.expressions ?? [],
        transcript: session.transcript ?? [],
        score_range: session.assessment?.scoreRange ?? "",
        repeat_sentences: session.assessment?.repeatSentences ?? [],
        created_at: session.createdAt ?? new Date().toISOString()
      })
    });
    await supabaseRequest(restPath("assessment_reports", "on_conflict=session_id"), {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ session_id: session.id, user_id: userId, report: session.assessment ?? {} })
    });
    await cloudRebuildMemory(userId, "new session assessment", session.id);
    return NextResponse.json({ ok: true, storageMode: "supabase", ...(await cloudPublicState(account)) });
  }

  if (action === "deleteSession") {
    const sessionId = String(body.sessionId ?? "");
    await supabaseRequest(restPath("practice_sessions", andEq({ id: sessionId, user_id: userId })), { method: "DELETE" });
    await cloudRebuildMemory(userId, "session deleted; memory rebuilt from remaining sessions", sessionId);
    return NextResponse.json({ ok: true, storageMode: "supabase", ...(await cloudPublicState(account)) });
  }

  if (action === "deleteHistory") {
    await supabaseRequest(restPath("practice_sessions", eq("user_id", userId)), { method: "DELETE" });
    await supabaseRequest(restPath("user_memory", eq("user_id", userId)), { method: "DELETE" });
    await cloudAddMemoryEvent({ userId, eventType: "deleted", sourceSessionId: null, reason: "all history deleted; derived memory cleared" });
    return NextResponse.json({ ok: true, storageMode: "supabase", ...(await cloudPublicState(account)) });
  }

  if (action === "clearMemory") {
    await supabaseRequest(restPath("user_memory", eq("user_id", userId)), { method: "DELETE" });
    await cloudAddMemoryEvent({ userId, eventType: "cleared", sourceSessionId: null, reason: "user cleared memory summary" });
    return NextResponse.json({ ok: true, storageMode: "supabase", ...(await cloudPublicState(account)) });
  }

  if (action === "deleteAccount") {
    await cloudAddMemoryEvent({ userId, eventType: "deleted", sourceSessionId: null, reason: "account deleted" });
    await supabaseRequest(restPath("app_users", eq("id", userId)), { method: "DELETE" });
    return NextResponse.json({ ok: true, storageMode: "supabase" });
  }

  return NextResponse.json({ ok: false, error: "unknown_action" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (supabaseConfig()) return handleCloudAction(body);
  const action = String(body.action ?? "");
  const db = await readDb();

  if (action === "login") {
    const email = String(body.email ?? "").trim();
    if (!email) return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 });
    const id = makeUserId(email);
    let account = db.accounts.find((item) => item.id === id);
    if (!account) {
      account = { id, email, provider: "email", createdAt: new Date().toISOString() };
      db.accounts.unshift(account);
      await writeDb(db);
    }
    const sessionToken = randomUUID();
    db.sessions[sessionToken] = account.id;
    await writeDb(db);
    return NextResponse.json({ ok: true, sessionToken, ...publicState(db, account) });
  }

  const userId = String(body.userId ?? "");
  const sessionToken = String(body.sessionToken ?? "");
  const account = db.accounts.find((item) => item.id === userId);
  if (!account || db.sessions[sessionToken] !== userId) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  if (action === "getState") {
    return NextResponse.json({ ok: true, ...publicState(db, account) });
  }

  if (action === "saveProfile") {
    db.profiles[userId] = body.profile ?? {};
    await writeDb(db);
    return NextResponse.json({ ok: true, ...publicState(db, account) });
  }

  if (action === "saveSession") {
    const history = Array.isArray(db.histories[userId]) ? db.histories[userId] : [];
    db.histories[userId] = [body.session, ...history].filter(Boolean).slice(0, 50);
    rebuildMemory(db, userId, "new session assessment", (body.session as StoredSession | undefined)?.id ?? null);
    await writeDb(db);
    return NextResponse.json({ ok: true, ...publicState(db, account) });
  }

  if (action === "deleteSession") {
    db.histories[userId] = (db.histories[userId] ?? []).filter((session) => {
      const candidate = session as { id?: string };
      return candidate.id !== body.sessionId;
    });
    rebuildMemory(db, userId, "session deleted; memory rebuilt from remaining sessions", String(body.sessionId ?? ""));
    await writeDb(db);
    return NextResponse.json({ ok: true, ...publicState(db, account) });
  }

  if (action === "deleteHistory") {
    db.histories[userId] = [];
    delete db.memories[userId];
    addMemoryEvent(db, { userId, eventType: "deleted", sourceSessionId: null, reason: "all history deleted; derived memory cleared" });
    await writeDb(db);
    return NextResponse.json({ ok: true, ...publicState(db, account) });
  }

  if (action === "clearMemory") {
    delete db.memories[userId];
    addMemoryEvent(db, { userId, eventType: "cleared", sourceSessionId: null, reason: "user cleared memory summary" });
    await writeDb(db);
    return NextResponse.json({ ok: true, ...publicState(db, account) });
  }

  if (action === "deleteAccount") {
    db.accounts = db.accounts.filter((item) => item.id !== userId);
    db.sessions = Object.fromEntries(Object.entries(db.sessions).filter(([, sessionUserId]) => sessionUserId !== userId));
    delete db.profiles[userId];
    delete db.histories[userId];
    delete db.memories[userId];
    addMemoryEvent(db, { userId, eventType: "deleted", sourceSessionId: null, reason: "account deleted" });
    await writeDb(db);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "unknown_action" }, { status: 400 });
}
