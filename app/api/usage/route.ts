import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const USAGE_FILE = path.join(process.cwd(), "data", "usage-db.json");
const DAILY_LIMIT = 5;

type UsageRecord = {
  [userId: string]: {
    [date: string]: { count: number; actions: { action: string; time: string }[] };
  };
};

async function readUsage(): Promise<UsageRecord> {
  try {
    const data = await fs.readFile(USAGE_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeUsage(data: UsageRecord) {
  await fs.mkdir(path.dirname(USAGE_FILE), { recursive: true });
  await fs.writeFile(USAGE_FILE, JSON.stringify(data, null, 2));
}

function getToday(): string {
  return new Date().toDateString();
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const action = body.action as "increment" | "get" | "check";
  const userId = body.userId as string;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "no_user_id" });
  }

  const usage = await readUsage();
  const today = getToday();

  if (!usage[userId]) usage[userId] = {};
  if (!usage[userId][today]) usage[userId][today] = { count: 0, actions: [] };

  if (action === "get" || action === "check") {
    return NextResponse.json({
      ok: true,
      used: usage[userId][today].count,
      limit: DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - usage[userId][today].count),
    });
  }

  if (action === "increment") {
    if (usage[userId][today].count >= DAILY_LIMIT) {
      return NextResponse.json({
        ok: false,
        error: "limit_exceeded",
        used: usage[userId][today].count,
        limit: DAILY_LIMIT,
        remaining: 0,
      });
    }

    usage[userId][today].count += 1;
    usage[userId][today].actions.push({
      action: body.usageType ?? "unknown",
      time: new Date().toISOString(),
    });

    await writeUsage(usage);

    return NextResponse.json({
      ok: true,
      used: usage[userId][today].count,
      limit: DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - usage[userId][today].count),
    });
  }

  return NextResponse.json({ ok: false, error: "invalid_action" });
}
