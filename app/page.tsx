"use client";

import {
  BriefcaseBusiness,
  Check,
  ChevronRight,
  History,
  LogIn,
  Mic,
  Pause,
  Volume2,
  RefreshCw,
  Save,
  Sparkles,
  UserRound
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Step = "home" | "profile" | "scenario" | "expressions" | "practice" | "assessment" | "history";
type ScenarioCategory = "meeting" | "update" | "requirements" | "interview" | "followup";
type ExpressionUse = "opening" | "clarifying" | "opinion" | "disagreeing" | "nextStep" | "followup";
type PracticeMode = "quick" | "standard" | "deep";

type Profile = {
  currentRole: string;
  targetRole: string;
  weakAreas: string;
  workContext: string;
  communicationGoal: string;
};

type WorkplaceTask = {
  id: string;
  category: ScenarioCategory;
  categoryLabel: string;
  title: string;
  role: string;
  audience: string;
  goal: string;
  situation: string;
  difficulty: string;
  turns: number;
  taskType: string;
  expressions: Record<ExpressionUse, ExpressionItem[]>;
  successCriteria: string[];
};

type ExpressionItem = {
  phrase: string;
  example: string;
  usage: string;
};

type TranscriptLine = { role: "ai" | "user"; text: string };

type PracticeSession = {
  id: string;
  userId: string;
  taskId: string;
  taskTitle: string;
  categoryLabel: string;
  role: string;
  expressions: string[];
  transcript: TranscriptLine[];
  assessment: Assessment;
  scoreRange: string;
  createdAt: string;
  repeatSentences: string[];
};

type Assessment = ReturnType<typeof assessSession>;
type SentenceRewrite = {
  original: string;
  improved: string;
  reason: string;
};

type Account = {
  id: string;
  email: string;
  provider: "email";
  createdAt: string;
};

type SupabasePasswordSession = {
  access_token?: string;
  user?: { id: string; email?: string };
};

type UserMemory = {
  summary: string;
  recurringWeaknesses: { label: string; evidence: string; count: number; lastSeen: string }[];
  strengths: string[];
  recommendedTaskId: string;
  recommendedReason: string;
  savedPhrases: { phrase: string; usage: string }[];
  lastPracticeAt: string;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognition;
    SpeechRecognition?: new () => SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start: () => void;
    stop: () => void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
  }

  interface SpeechRecognitionEvent {
    results: {
      [index: number]: {
        [index: number]: {
          transcript: string;
        };
      };
    };
  }
}

const expressionUseLabels: Record<ExpressionUse, string> = {
  opening: "开场",
  clarifying: "澄清",
  opinion: "表达观点",
  disagreeing: "礼貌反对",
  nextStep: "推进下一步",
  followup: "总结 / Follow-up"
};

const scenarioTasks: WorkplaceTask[] = [
  {
    id: "meeting-risk-callout",
    category: "meeting",
    categoryLabel: "会议发言",
    title: "Raise a delivery risk",
    role: "Project member",
    audience: "Manager and teammates",
    goal: "Explain a delivery risk, give evidence, and suggest the next step.",
    situation: "Your team may miss a feature deadline because the API spec changed yesterday.",
    difficulty: "中等",
    turns: 5,
    taskType: "Team meeting",
    expressions: {
      opening: [
        {
          phrase: "I want to flag a potential risk.",
          example: "I want to flag a potential risk with the API timeline.",
          usage: "适合在会议中自然提出风险。"
        }
      ],
      clarifying: [
        {
          phrase: "Just to make sure I understand correctly...",
          example: "Just to make sure I understand correctly, the spec changed after QA started, right?",
          usage: "适合确认事实，避免误解。"
        }
      ],
      opinion: [
        {
          phrase: "From my perspective, the main issue is...",
          example: "From my perspective, the main issue is not the code, but the unclear dependency.",
          usage: "适合清楚表达判断。"
        }
      ],
      disagreeing: [
        {
          phrase: "I see your point, but I am concerned that...",
          example: "I see your point, but I am concerned that rushing this could create more bugs.",
          usage: "适合礼貌表达不同意见。"
        }
      ],
      nextStep: [
        {
          phrase: "The next step I suggest is...",
          example: "The next step I suggest is to confirm the API contract today and adjust the release scope.",
          usage: "适合把讨论推进到行动。"
        }
      ],
      followup: [
        {
          phrase: "I will follow up with a written summary.",
          example: "I will follow up with a written summary after this meeting.",
          usage: "适合会议结尾承诺后续动作。"
        }
      ]
    },
    successCriteria: ["risk is clear", "evidence is specific", "next step is actionable"]
  },
  {
    id: "update-weekly-progress",
    category: "update",
    categoryLabel: "项目汇报",
    title: "Give a weekly progress update",
    role: "Product or engineering owner",
    audience: "Cross-functional team",
    goal: "Summarize progress, blockers, and next actions in a concise update.",
    situation: "You need to give a 60-second weekly update in a remote standup.",
    difficulty: "基础",
    turns: 4,
    taskType: "Standup update",
    expressions: {
      opening: [
        {
          phrase: "Here is a quick update on...",
          example: "Here is a quick update on the onboarding flow.",
          usage: "适合简洁开始汇报。"
        }
      ],
      clarifying: [
        {
          phrase: "The current status is...",
          example: "The current status is that design is ready, but QA has one open issue.",
          usage: "适合明确当前状态。"
        }
      ],
      opinion: [
        {
          phrase: "The biggest priority now is...",
          example: "The biggest priority now is to unblock the payment callback test.",
          usage: "适合突出重点。"
        }
      ],
      disagreeing: [
        {
          phrase: "I would be careful about assuming that...",
          example: "I would be careful about assuming that this is only a frontend issue.",
          usage: "适合谨慎纠正过早结论。"
        }
      ],
      nextStep: [
        {
          phrase: "By the next update, I expect to...",
          example: "By the next update, I expect to finish the smoke test and share the risks.",
          usage: "适合说明下一步交付。"
        }
      ],
      followup: [
        {
          phrase: "I will share the details after the call.",
          example: "I will share the details after the call so we can keep this update short.",
          usage: "适合控制会议时间。"
        }
      ]
    },
    successCriteria: ["progress is concise", "blocker is visible", "next action has owner"]
  },
  {
    id: "requirements-clarify-scope",
    category: "requirements",
    categoryLabel: "需求确认",
    title: "Clarify an unclear requirement",
    role: "Developer or product teammate",
    audience: "Product manager",
    goal: "Ask clarifying questions and confirm acceptance criteria.",
    situation: "A task says 'improve speaking report', but the expected report fields are unclear.",
    difficulty: "中等",
    turns: 5,
    taskType: "Requirement discussion",
    expressions: {
      opening: [
        {
          phrase: "Can we clarify the expected outcome first?",
          example: "Can we clarify the expected outcome first before I estimate the work?",
          usage: "适合把模糊需求拉回目标。"
        }
      ],
      clarifying: [
        {
          phrase: "When you say..., do you mean...?",
          example: "When you say detailed report, do you mean transcript evidence or a longer summary?",
          usage: "适合追问定义。"
        }
      ],
      opinion: [
        {
          phrase: "My recommendation is to start with...",
          example: "My recommendation is to start with three required fields and add charts later.",
          usage: "适合给出实现建议。"
        }
      ],
      disagreeing: [
        {
          phrase: "I agree with the goal, but the scope may be too broad.",
          example: "I agree with the goal, but the scope may be too broad for this sprint.",
          usage: "适合控制范围。"
        }
      ],
      nextStep: [
        {
          phrase: "If that matches your expectation, I will...",
          example: "If that matches your expectation, I will update the task and start implementation.",
          usage: "适合确认后行动。"
        }
      ],
      followup: [
        {
          phrase: "Let me write down the acceptance criteria.",
          example: "Let me write down the acceptance criteria so we can avoid ambiguity.",
          usage: "适合结束需求讨论。"
        }
      ]
    },
    successCriteria: ["asks precise questions", "confirms acceptance criteria", "controls scope"]
  },
  {
    id: "update-delay-plan",
    category: "update",
    categoryLabel: "项目汇报",
    title: "Explain a delay and recovery plan",
    role: "Project owner",
    audience: "Manager",
    goal: "Explain a delay without sounding defensive and propose a realistic recovery plan.",
    situation: "A dependency from another team is late, so your launch date may slip by three days.",
    difficulty: "中等",
    turns: 6,
    taskType: "Delay update",
    expressions: {
      opening: [
        {
          phrase: "We are running into a delay because...",
          example: "We are running into a delay because the vendor API approval is not ready yet.",
          usage: "适合说明延期原因，不显得推卸责任。"
        }
      ],
      clarifying: [
        {
          phrase: "The dependency is...",
          example: "The dependency is the final API approval from the payments team.",
          usage: "适合把阻塞点说具体。"
        }
      ],
      opinion: [
        {
          phrase: "The main risk is...",
          example: "The main risk is that QA will not have enough time for the full regression pass.",
          usage: "适合说明业务影响。"
        }
      ],
      disagreeing: [
        {
          phrase: "I would not recommend rushing this part because...",
          example: "I would not recommend rushing this part because it touches the payment flow.",
          usage: "适合专业地反对硬赶进度。"
        }
      ],
      nextStep: [
        {
          phrase: "My recovery plan is...",
          example: "My recovery plan is to split the release and ship the lower-risk items first.",
          usage: "适合把问题转成方案。"
        }
      ],
      followup: [
        {
          phrase: "I will send an updated timeline by...",
          example: "I will send an updated timeline by 5 p.m. today.",
          usage: "适合给出明确跟进时间。"
        }
      ]
    },
    successCriteria: ["delay reason is specific", "risk is clear", "recovery plan is realistic"]
  },
  {
    id: "update-metric-drop",
    category: "update",
    categoryLabel: "项目汇报",
    title: "Report a metric drop",
    role: "Growth or product owner",
    audience: "Leadership team",
    goal: "Report a negative metric, explain likely causes, and propose an investigation plan.",
    situation: "Activation dropped by 12% after the latest onboarding change.",
    difficulty: "进阶",
    turns: 6,
    taskType: "Metric update",
    expressions: {
      opening: [
        {
          phrase: "I want to call out a change in the numbers.",
          example: "I want to call out a change in the activation numbers after the latest release.",
          usage: "适合主动报告异常数据。"
        }
      ],
      clarifying: [
        {
          phrase: "The drop appears to be related to...",
          example: "The drop appears to be related to the new phone verification step.",
          usage: "适合说明初步判断，避免绝对化。"
        }
      ],
      opinion: [
        {
          phrase: "My current hypothesis is...",
          example: "My current hypothesis is that users are dropping off before they understand the value.",
          usage: "适合表达可验证假设。"
        }
      ],
      disagreeing: [
        {
          phrase: "I would avoid jumping to that conclusion until...",
          example: "I would avoid jumping to that conclusion until we compare new and returning users.",
          usage: "适合阻止过早归因。"
        }
      ],
      nextStep: [
        {
          phrase: "The investigation I suggest is...",
          example: "The investigation I suggest is to compare funnel steps and review session recordings.",
          usage: "适合把坏消息转成行动计划。"
        }
      ],
      followup: [
        {
          phrase: "I will come back with findings by...",
          example: "I will come back with findings by tomorrow morning.",
          usage: "适合给出复盘时间点。"
        }
      ]
    },
    successCriteria: ["metric is stated clearly", "hypothesis is not overstated", "investigation plan is concrete"]
  },
  {
    id: "requirements-confirm-deadline",
    category: "requirements",
    categoryLabel: "需求确认",
    title: "Confirm a deadline and trade-off",
    role: "Product or engineering partner",
    audience: "Stakeholder",
    goal: "Clarify deadline pressure and negotiate scope trade-offs professionally.",
    situation: "A stakeholder asks whether a dashboard can be shipped by Friday, but the requested filters are not finalized.",
    difficulty: "中等",
    turns: 5,
    taskType: "Deadline clarification",
    expressions: {
      opening: [
        {
          phrase: "Before I commit to the timeline, can I clarify...",
          example: "Before I commit to the timeline, can I clarify which filters are required for Friday?",
          usage: "适合承诺前确认范围。"
        }
      ],
      clarifying: [
        {
          phrase: "Is this a must-have for launch, or can it follow later?",
          example: "Is the export filter a must-have for launch, or can it follow later?",
          usage: "适合区分必须项和后续项。"
        }
      ],
      opinion: [
        {
          phrase: "If the deadline is fixed, I suggest we reduce scope by...",
          example: "If the deadline is fixed, I suggest we reduce scope by shipping the top three filters first.",
          usage: "适合提出取舍方案。"
        }
      ],
      disagreeing: [
        {
          phrase: "I am concerned that committing to both may create quality risk.",
          example: "I am concerned that committing to both the deadline and the full filter set may create quality risk.",
          usage: "适合说明不能全都要。"
        }
      ],
      nextStep: [
        {
          phrase: "Can we align on the priority order?",
          example: "Can we align on the priority order so I can give you a reliable plan?",
          usage: "适合推动对方做优先级决策。"
        }
      ],
      followup: [
        {
          phrase: "I will document the agreed scope after this.",
          example: "I will document the agreed scope after this so we have a clear handoff.",
          usage: "适合会后确认。"
        }
      ]
    },
    successCriteria: ["deadline is clarified", "trade-off is explicit", "scope agreement is documented"]
  },
  {
    id: "requirements-restate-ambiguous-request",
    category: "requirements",
    categoryLabel: "需求确认",
    title: "Restate an ambiguous request",
    role: "Designer or engineer",
    audience: "Requester",
    goal: "Restate an ambiguous request and confirm what success looks like.",
    situation: "A teammate says the page should feel more premium, but does not define what premium means.",
    difficulty: "基础",
    turns: 4,
    taskType: "Ambiguity clarification",
    expressions: {
      opening: [
        {
          phrase: "Let me restate what I heard.",
          example: "Let me restate what I heard: you want the page to feel more premium without adding extra steps.",
          usage: "适合复述理解，降低误解。"
        }
      ],
      clarifying: [
        {
          phrase: "What would be a concrete example of that?",
          example: "What would be a concrete example of a more premium report experience?",
          usage: "适合把抽象词变具体。"
        }
      ],
      opinion: [
        {
          phrase: "A practical interpretation could be...",
          example: "A practical interpretation could be cleaner spacing, stronger hierarchy, and fewer generic labels.",
          usage: "适合给出可执行解释。"
        }
      ],
      disagreeing: [
        {
          phrase: "I worry that this may be too subjective unless we define...",
          example: "I worry that this may be too subjective unless we define the success criteria.",
          usage: "适合提醒标准不清。"
        }
      ],
      nextStep: [
        {
          phrase: "Can we agree on two acceptance criteria?",
          example: "Can we agree on two acceptance criteria before I start the redesign?",
          usage: "适合推进验收标准。"
        }
      ],
      followup: [
        {
          phrase: "I will turn this into a short checklist.",
          example: "I will turn this into a short checklist and send it back for confirmation.",
          usage: "适合落地需求。"
        }
      ]
    },
    successCriteria: ["request is restated", "abstract words become concrete", "success criteria are confirmed"]
  },
  {
    id: "interview-conflict-example",
    category: "interview",
    categoryLabel: "面试回答",
    title: "Answer a conflict question",
    role: "Candidate",
    audience: "Interviewer",
    goal: "Answer a behavioral question with a clear situation, action, and result.",
    situation: "The interviewer asks you to describe a time you disagreed with a teammate.",
    difficulty: "进阶",
    turns: 6,
    taskType: "Behavioral interview",
    expressions: {
      opening: [
        {
          phrase: "One example that comes to mind is...",
          example: "One example that comes to mind is a release planning disagreement last quarter.",
          usage: "适合面试中自然引入故事。"
        }
      ],
      clarifying: [
        {
          phrase: "The context was that...",
          example: "The context was that we had two competing priorities and limited QA time.",
          usage: "适合交代背景。"
        }
      ],
      opinion: [
        {
          phrase: "What I learned from that experience was...",
          example: "What I learned from that experience was to separate the person from the problem.",
          usage: "适合展示反思。"
        }
      ],
      disagreeing: [
        {
          phrase: "I disagreed with the approach, not with the person.",
          example: "I disagreed with the approach, not with the person, so I focused on data.",
          usage: "适合职业化表达冲突。"
        }
      ],
      nextStep: [
        {
          phrase: "To move things forward, I...",
          example: "To move things forward, I proposed a smaller release and a follow-up milestone.",
          usage: "适合说明行动。"
        }
      ],
      followup: [
        {
          phrase: "The result was...",
          example: "The result was that we shipped on time and reduced the risk for the next sprint.",
          usage: "适合收尾并量化结果。"
        }
      ]
    },
    successCriteria: ["uses clear story structure", "shows professional conflict handling", "mentions result"]
  },
  {
    id: "followup-client-delay",
    category: "followup",
    categoryLabel: "客户/同事 Follow-up",
    title: "Follow up after a delay",
    role: "Account or project owner",
    audience: "Client",
    goal: "Acknowledge the delay, protect trust, and propose a concrete recovery plan.",
    situation: "A client deliverable is delayed by two days and you need to explain it professionally.",
    difficulty: "进阶",
    turns: 5,
    taskType: "Client communication",
    expressions: {
      opening: [
        {
          phrase: "I wanted to give you a quick update on...",
          example: "I wanted to give you a quick update on the report delivery timeline.",
          usage: "适合主动说明进展。"
        }
      ],
      clarifying: [
        {
          phrase: "The reason for the delay is...",
          example: "The reason for the delay is that we are validating one data source again.",
          usage: "适合解释原因但不过度辩解。"
        }
      ],
      opinion: [
        {
          phrase: "To make sure the quality is right, we are...",
          example: "To make sure the quality is right, we are doing one final review before sharing it.",
          usage: "适合把延迟和质量关联。"
        }
      ],
      disagreeing: [
        {
          phrase: "I understand the urgency, and I do not want to overpromise.",
          example: "I understand the urgency, and I do not want to overpromise a time we cannot meet.",
          usage: "适合专业地设定边界。"
        }
      ],
      nextStep: [
        {
          phrase: "Here is the recovery plan.",
          example: "Here is the recovery plan: we will send a draft today and the final version tomorrow.",
          usage: "适合给出补救计划。"
        }
      ],
      followup: [
        {
          phrase: "I will keep you posted by...",
          example: "I will keep you posted by 5 p.m. today with the latest status.",
          usage: "适合降低对方不确定感。"
        }
      ]
    },
    successCriteria: ["acknowledges impact", "gives reason", "sets next update time"]
  }
];

const practiceModes: Record<PracticeMode, { label: string; turns: number; helper: string }> = {
  quick: { label: "Quick 4 轮", turns: 4, helper: "适合低压力热身。" },
  standard: { label: "Workplace 6 轮", turns: 6, helper: "适合完整完成任务。" },
  deep: { label: "Deep 8 轮", turns: 8, helper: "适合面试/客户高压练习。" }
};

const starterProfile: Profile = {
  currentRole: "Product / Engineering",
  targetRole: "Remote team contributor",
  weakAreas: "回答太短、表达不够自然、会议里反应慢",
  workContext: "远程会议、项目汇报、跨团队协作",
  communicationGoal: "说清楚、说自然、说专业，并能推进下一步"
};

const storageKeys = {
  accounts: "speakloop:accounts",
  currentUserId: "speakloop:currentUserId",
  sessionToken: "speakloop:sessionToken",
  supabaseAccessToken: "speakloop:supabaseAccessToken"
};

function pickRecommendedTask(memory: UserMemory | null) {
  return scenarioTasks.find((task) => task.id === memory?.recommendedTaskId) ?? scenarioTasks.find((task) => task.category === "update") ?? scenarioTasks[0];
}

function supabaseBrowserConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

async function supabasePasswordLogin(email: string, password: string): Promise<SupabasePasswordSession> {
  const config = supabaseBrowserConfig();
  if (!config) return {};
  const login = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });
  if (login.ok) return (await login.json()) as SupabasePasswordSession;

  const signup = await fetch(`${config.url}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });
  if (!signup.ok) throw new Error("supabase_auth_failed");
  return (await signup.json()) as SupabasePasswordSession;
}

function flattenExpressions(task: WorkplaceTask) {
  return (Object.keys(expressionUseLabels) as ExpressionUse[]).flatMap((key) => task.expressions[key]);
}

function nextAiPrompt(task: WorkplaceTask, turn: number, target: string | undefined, maxTurns: number) {
  const prompts = [
    `Role play: I am your ${task.audience.toLowerCase()}. ${task.situation} Start by explaining the situation and your goal.`,
    `Can you be more specific? Try to use "${target ?? "one workplace expression"}".`,
    "What concern or question do you think the other person may have?",
    "How would you respond professionally without sounding defensive?",
    "What concrete next step would you propose?",
    "Can you summarize the decision or follow-up in one clear sentence?",
    "What would you say if the other person pushes back?",
    "Give a final version that is clear, natural, professional, and action-oriented."
  ];
  if (turn >= maxTurns - 1) return prompts[7];
  return prompts[turn] ?? "Can you make your answer more specific and action-oriented?";
}

function assessSession(transcript: TranscriptLine[], selected: string[]) {
  const userText = transcript
    .filter((line) => line.role === "user")
    .map((line) => line.text)
    .join(" ")
    .toLowerCase();
  const wordCount = userText.split(/\s+/).filter(Boolean).length;
  const reuse = selected.filter((phrase) =>
    phrase
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 4)
      .some((word) => userText.includes(word.replace(/[.,]/g, "")))
  ).length;
  const range = wordCount > 70 && reuse > 1 ? "Workplace-ready" : wordCount > 40 ? "Developing" : "Needs structure";
  const completionSummary =
    range === "Workplace-ready"
      ? "这轮基本完成了工作沟通目标：问题、影响和下一步都比较清楚。"
      : range === "Developing"
        ? "这轮部分完成了工作沟通目标：主要意思清楚，但下一步和责任边界还需要更具体。"
        : "这轮还没有稳定完成工作沟通目标：建议先补清楚背景、问题和下一步。";

  return {
    scoreRange: range,
    completionSummary,
    clarity: wordCount > 45 ? "你能说明主要意思；下一步要把背景、问题、行动分得更清楚。" : "回答偏短，建议先用背景、问题、下一步三段式组织。",
    naturalness: reuse ? "已经尝试复用目标表达；继续注意语气要像真实会议，而不是背句子。" : "目标表达使用不足，建议先主动使用 1-2 个工作场景表达。",
    professionalTone: "语气基本可接受；下一步要减少过度直接的说法，加入礼貌缓冲和责任边界。",
    interaction: "可以继续加强接话、确认和追问，让对话更像真实协作，而不是单向回答。",
    taskCompletion: "建议每轮都给出明确下一步、负责人或时间点，这会显著提升工作沟通效果。",
    sentenceRewrites: [
      {
        original: "I cannot finish it on time.",
        improved: "We are running into a delay, and I suggest we adjust the timeline to protect quality.",
        reason: "更适合职场语境：说明问题，同时给出下一步。"
      }
    ],
    repeatSentences: [
      `${selected[0] ?? "I want to flag a potential risk"} and suggest a practical next step.`,
      "Just to make sure I understand correctly, the main concern is the timeline, right?",
      "For the next real meeting, say: The next step I suggest is to confirm the owner and follow up by the end of today."
    ]
  };
}

export default function Home() {
  const [step, setStep] = useState<Step>("home");
  const [account, setAccount] = useState<Account | null>(null);
  const [loginInput, setLoginInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [profile, setProfile] = useState<Profile>(starterProfile);
  const [memory, setMemory] = useState<UserMemory | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ScenarioCategory | "all">("all");
  const [taskSearch, setTaskSearch] = useState("");
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("standard");
  const [selectedTask, setSelectedTask] = useState<WorkplaceTask>(scenarioTasks[0]);
  const [selectedExpressions, setSelectedExpressions] = useState<string[]>([]);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [reply, setReply] = useState("");
  const [turn, setTurn] = useState(0);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [history, setHistory] = useState<PracticeSession[]>([]);
  const [voiceStatus, setVoiceStatus] = useState("正在检测语音输入能力...");
  const [coachStatus, setCoachStatus] = useState("DeepSeek 未配置时会自动使用本地 workplace fallback。");
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [speechStatus, setSpeechStatus] = useState("正在检测 AI 语音回复能力...");
  const [canSpeak, setCanSpeak] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceLatencyMs, setVoiceLatencyMs] = useState<number | null>(null);

  const maxTurns = practiceModes[practiceMode].turns;
  const currentExpressions = useMemo(() => selectedTask.expressions, [selectedTask]);
  const filteredTasks = useMemo(() => {
    const query = taskSearch.trim().toLowerCase();
    return scenarioTasks.filter((task) => {
      if (categoryFilter !== "all" && task.category !== categoryFilter) return false;
      if (!query) return true;
      return [task.categoryLabel, task.title, task.goal, task.situation, task.role, task.audience, task.taskType]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [categoryFilter, taskSearch]);
  const canSave = Boolean(account);
  const recommendedTask = pickRecommendedTask(memory);

  function applyAccountState(data: { account: Account; profile: Profile | null; history: PracticeSession[]; memory: UserMemory | null }) {
    setAccount(data.account);
    setLoginInput(data.account.email);
    setProfile(data.profile ? { ...starterProfile, ...data.profile } : starterProfile);
    setHistory(data.history ?? []);
    setMemory(data.memory ?? null);
  }

  async function accountMemoryRequest(body: Record<string, unknown>) {
    const sessionToken = localStorage.getItem(storageKeys.sessionToken);
    const supabaseAccessToken = localStorage.getItem(storageKeys.supabaseAccessToken);
    const response = await fetch("/api/account-memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        body.action !== "login"
          ? { ...body, ...(sessionToken ? { sessionToken } : {}), ...(supabaseAccessToken ? { supabaseAccessToken } : {}) }
          : { ...body, ...(supabaseAccessToken ? { supabaseAccessToken } : {}) }
      )
    });
    if (!response.ok) throw new Error("account_memory_request_failed");
    return response.json();
  }

  useEffect(() => {
    const currentUserId = localStorage.getItem(storageKeys.currentUserId);
    if (currentUserId) {
      accountMemoryRequest({ action: "getState", userId: currentUserId })
        .then((data) => applyAccountState(data))
        .catch(() => {
          localStorage.removeItem(storageKeys.currentUserId);
          localStorage.removeItem(storageKeys.sessionToken);
          localStorage.removeItem(storageKeys.supabaseAccessToken);
        });
    }

    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceStatus("当前浏览器不支持 Web Speech，可使用文字输入继续。");
    } else {
      const instance = new Recognition();
      instance.lang = "en-US";
      instance.continuous = false;
      instance.interimResults = false;
      instance.onresult = (event) => {
        setReply(event.results[0][0].transcript);
        setVoiceStatus("已转写，可以检查后发送。");
      };
      instance.onerror = () => {
        setIsListening(false);
        setVoiceStatus("语音输入失败，请改用文字输入或重试。");
      };
      instance.onend = () => setIsListening(false);
      setRecognition(instance);
      setVoiceStatus("可点击麦克风语音回答；权限失败时可直接输入文字。");
    }

    if ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
      setCanSpeak(true);
      setSpeechStatus("AI Coach 会自动语音回复；可重听或停止。");
    } else {
      setSpeechStatus("当前浏览器不支持 AI 语音播放，已降级为文字回复。");
    }

    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault();
    const email = loginInput.trim();
    if (!email) return;
    const supabaseConfig = supabaseBrowserConfig();
    if (supabaseConfig) {
      if (!passwordInput.trim()) return;
      const auth = await supabasePasswordLogin(email, passwordInput.trim());
      if (auth.access_token) localStorage.setItem(storageKeys.supabaseAccessToken, auth.access_token);
    }
    const data = await accountMemoryRequest({ action: "login", email });
    localStorage.setItem(storageKeys.currentUserId, data.account.id);
    localStorage.setItem(storageKeys.sessionToken, data.sessionToken);
    applyAccountState(data);
  }

  function logout() {
    localStorage.removeItem(storageKeys.currentUserId);
    localStorage.removeItem(storageKeys.sessionToken);
    localStorage.removeItem(storageKeys.supabaseAccessToken);
    setAccount(null);
    setLoginInput("");
    setProfile(starterProfile);
    setHistory([]);
    setMemory(null);
  }

  async function deleteAccount() {
    if (!account) return;
    await accountMemoryRequest({ action: "deleteAccount", userId: account.id });
    logout();
  }

  async function saveProfile() {
    if (account) {
      const data = await accountMemoryRequest({ action: "saveProfile", userId: account.id, profile });
      applyAccountState(data);
    }
    setStep("scenario");
  }

  function chooseTask(task: WorkplaceTask) {
    setSelectedTask(task);
    setSelectedExpressions([]);
    setPracticeMode(task.turns <= 4 ? "quick" : task.turns >= 6 ? "standard" : "quick");
    setStep("expressions");
  }

  function toggleExpression(phrase: string) {
    setSelectedExpressions((current) => {
      if (current.includes(phrase)) return current.filter((item) => item !== phrase);
      if (current.length >= 4) return current;
      return [...current, phrase];
    });
  }

  function startPractice() {
    const defaults = flattenExpressions(selectedTask).slice(0, 3).map((item) => item.phrase);
    const targets = selectedExpressions.length ? selectedExpressions : defaults;
    const opening = nextAiPrompt(selectedTask, 0, targets[0], maxTurns);
    setSelectedExpressions(targets);
    setTranscript([{ role: "ai", text: opening }]);
    setTurn(0);
    setAssessment(null);
    setStep("practice");
    speakCoach(opening);
  }

  function speakCoach(text?: string, requestedAt?: number) {
    if (!text?.trim()) return;
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setSpeechStatus("当前浏览器不支持 AI 语音播放，已降级为文字回复。");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\n+/g, " "));
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onstart = () => {
      if (requestedAt) setVoiceLatencyMs(Date.now() - requestedAt);
      setIsSpeaking(true);
      setSpeechStatus("AI Coach 正在语音回复...");
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeechStatus("轮到你说。可以语音回答，也可以重听上一句。");
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeechStatus("AI 语音播放失败，已保留文字回复。");
    };
    window.speechSynthesis.speak(utterance);
  }

  function stopCoachSpeech() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeechStatus("已停止 AI 语音。");
  }

  function replayLastCoachTurn() {
    const lastCoachLine = [...transcript].reverse().find((line) => line.role === "ai");
    speakCoach(lastCoachLine?.text);
  }

  async function askCoach(action: "dialogue" | "assessment", nextTranscript: TranscriptLine[]) {
    const response = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        mode: "workplace",
        task: selectedTask,
        profile,
        memory,
        targetExpressions: selectedExpressions,
        transcript: nextTranscript
      })
    });
    return response.json();
  }

  async function sendReply(event: FormEvent) {
    event.preventDefault();
    const clean = reply.trim();
    if (!clean || isThinking) return;
    const replySentAt = Date.now();
    const nextTranscript: TranscriptLine[] = [...transcript, { role: "user", text: clean }];
    const nextTurn = turn + 1;
    setReply("");
    setTranscript(nextTranscript);
    setIsThinking(true);

    if (nextTurn >= maxTurns) {
      let result = assessSession(nextTranscript, selectedExpressions);
      try {
        const coach = await askCoach("assessment", nextTranscript);
        setCoachStatus(coach.source === "deepseek" ? "DeepSeek 已生成职场沟通反馈。" : "未配置 DeepSeek 或调用失败，已使用本地评估。");
        if (coach.assessment) result = coach.assessment as Assessment;
      } catch {
        setCoachStatus("评估接口不可用，已使用本地评估。");
      }
      setTranscript(nextTranscript);
      setAssessment(result);
      setStep("assessment");
      setIsThinking(false);
      if (account) {
        const session: PracticeSession = {
          id: crypto.randomUUID(),
          userId: account.id,
          taskId: selectedTask.id,
          taskTitle: selectedTask.title,
          categoryLabel: selectedTask.categoryLabel,
          role: selectedTask.role,
          expressions: selectedExpressions,
          transcript: nextTranscript,
          assessment: result,
          scoreRange: result.scoreRange,
          repeatSentences: result.repeatSentences,
          createdAt: new Date().toISOString()
        };
        const data = await accountMemoryRequest({
          action: "saveSession",
          userId: account.id,
          session
        });
        applyAccountState(data);
      }
      return;
    }

    let nextQuestion = nextAiPrompt(selectedTask, nextTurn, selectedExpressions[nextTurn % selectedExpressions.length], maxTurns);
    let suggestion = "";
    try {
      const coach = await askCoach("dialogue", nextTranscript);
      setCoachStatus(coach.source === "deepseek" ? "DeepSeek 已按职场角色继续追问。" : "未配置 DeepSeek 或调用失败，已使用本地追问。");
      if (coach.nextQuestion) nextQuestion = coach.nextQuestion;
      if (coach.suggestion) suggestion = `\n\n表达建议：${coach.suggestion}`;
    } catch {
      setCoachStatus("对话接口不可用，已使用本地追问。");
    }

    const coachReply = `${nextQuestion}${suggestion}`;
    setTranscript([...nextTranscript, { role: "ai", text: coachReply }]);
    setTurn(nextTurn);
    setIsThinking(false);
    speakCoach(coachReply, replySentAt);
  }

  function startVoice() {
    if (!recognition) {
      setVoiceStatus("当前浏览器不支持语音输入，请使用文字输入。");
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }
    setIsListening(true);
    setVoiceStatus("正在听，请用英文完成职场回答...");
    recognition.start();
  }

  return (
    <main className="app">
      <section className="device">
        <header className="appHeader">
          <div>
            <p className="eyebrow">Workplace AI Speaking</p>
            <h1>SpeakLoop</h1>
          </div>
          <button className="iconButton" type="button" onClick={() => setStep("history")} aria-label="history">
            <History size={20} />
          </button>
        </header>

        <nav className="bottomNav" aria-label="main navigation">
          <button className={step === "home" ? "active" : ""} type="button" onClick={() => setStep("home")}>
            <UserRound size={18} /> 首页
          </button>
          <button className={step === "scenario" ? "active" : ""} type="button" onClick={() => setStep("scenario")}>
            <BriefcaseBusiness size={18} /> 场景
          </button>
          <button className={step === "history" ? "active" : ""} type="button" onClick={() => setStep("history")}>
            <History size={18} /> 记录
          </button>
        </nav>

        {step === "home" && (
          <section className="screen slideScreen">
            <div className="heroPanel">
              <div>
                <p className="eyebrow">职场 / 远程工作口语</p>
                <h2>练会议、汇报、面试和客户沟通，把英语说清楚、自然、专业。</h2>
              </div>
              <Sparkles className="heroIcon" size={44} />
            </div>

            <form className="loginPanel" onSubmit={login}>
              <div>
                <h3>{account ? "已登录账号" : "邮箱登录后启用记忆"}</h3>
                <p>{account ? `${account.email} · ${account.id}` : "游客可以体验；邮箱登录后按 user_id 隔离保存 profile、历史和 memory。"}</p>
              </div>
              <div className="loginRow">
                <input
                  value={loginInput}
                  onChange={(event) => setLoginInput(event.target.value)}
                  placeholder="email@example.com"
                  type="email"
                />
                {supabaseBrowserConfig() && (
                  <input
                    value={passwordInput}
                    onChange={(event) => setPasswordInput(event.target.value)}
                    placeholder="password"
                    type="password"
                    minLength={6}
                  />
                )}
                <button type="submit">
                  <LogIn size={18} />
                </button>
              </div>
              {supabaseBrowserConfig() && !account && <small className="helperText">云端模式：用邮箱 + 密码注册/登录，跨设备恢复历史和记忆。</small>}
              <button className="secondaryAction compact" type="button" disabled title="WeChat login will be enabled for domestic commercial launch">
                微信登录暂未开放
              </button>
              {account && (
                <div className="actionRow">
                  <button className="textButton" type="button" onClick={logout}>
                    退出当前账号
                  </button>
                  <button className="textButton" type="button" onClick={deleteAccount}>
                    删除账号数据
                  </button>
                </div>
              )}
            </form>

            {account && (
              <div className="sourceNote">
                <strong>下次推荐：{recommendedTask.title}</strong>
                <span>{memory?.recommendedReason ?? "完成一次练习后，系统会根据你的弱项推荐下一次任务。"}</span>
                <button className="textButton" type="button" onClick={() => chooseTask(recommendedTask)}>
                  练推荐任务
                </button>
              </div>
            )}

            <div className="quickGrid">
              <button type="button" onClick={() => setStep("profile")}>
                <UserRound size={21} />
                <span>工作档案</span>
                <small>{profile.currentRole} · {profile.targetRole}</small>
              </button>
              <button type="button" onClick={() => setStep("scenario")}>
                <BriefcaseBusiness size={21} />
                <span>开始练习</span>
                <small>会议 / 汇报 / 面试 / 客户沟通</small>
              </button>
            </div>
          </section>
        )}

        {step === "profile" && (
          <section className="screen slideScreen">
            <ScreenTitle title="工作口语档案" subtitle="用于定制角色、任务难度和反馈重点。" />
            <div className="formStack">
              <label>
                当前角色
                <input value={profile.currentRole} onChange={(event) => setProfile({ ...profile, currentRole: event.target.value })} />
              </label>
              <label>
                目标角色 / 场景
                <input value={profile.targetRole} onChange={(event) => setProfile({ ...profile, targetRole: event.target.value })} />
              </label>
              <label>
                工作场景
                <textarea value={profile.workContext} onChange={(event) => setProfile({ ...profile, workContext: event.target.value })} />
              </label>
              <label>
                自评弱项
                <textarea value={profile.weakAreas} onChange={(event) => setProfile({ ...profile, weakAreas: event.target.value })} />
              </label>
              <label>
                练习目标
                <textarea
                  value={profile.communicationGoal}
                  onChange={(event) => setProfile({ ...profile, communicationGoal: event.target.value })}
                />
              </label>
            </div>
            {account && (
              <div className="sourceNote">
                <strong>SpeakLoop 记住了什么</strong>
                <span>{memory?.summary ?? "还没有长期记忆。完成一次账号内练习后，这里会生成结构化记忆。"}</span>
                {memory?.recurringWeaknesses.map((item) => (
                  <span key={item.label}>弱项：{item.label} · {item.evidence}</span>
                ))}
                {memory && (
                  <button
                    className="textButton"
                    type="button"
                    onClick={async () => {
                      const data = await accountMemoryRequest({ action: "clearMemory", userId: account.id });
                      applyAccountState(data);
                    }}
                  >
                    清空记忆摘要
                  </button>
                )}
              </div>
            )}
            <button className="primaryAction" type="button" onClick={saveProfile}>
              <Save size={19} /> 保存并选场景
            </button>
          </section>
        )}

        {step === "scenario" && (
          <section className="screen slideScreen">
            <ScreenTitle title="选择职场任务" subtitle="每个任务都有角色、目标和追问路径。" />
            <div className="segmented">
              {(["all", "meeting", "update", "requirements", "interview", "followup"] as const).map((item) => (
                <button
                  className={categoryFilter === item ? "active" : ""}
                  key={item}
                  type="button"
                  onClick={() => setCategoryFilter(item)}
                >
                  {item === "all" ? "全部" : scenarioTasks.find((task) => task.category === item)?.categoryLabel}
                </button>
              ))}
            </div>
            <label className="searchBox">
              搜索任务
              <input
                value={taskSearch}
                onChange={(event) => setTaskSearch(event.target.value)}
                placeholder="搜索 meeting、client、delay、interview..."
              />
            </label>
            <p className="countText">当前显示 {filteredTasks.length} 个 Workplace 任务</p>
            <div className="topicList">
              {filteredTasks.map((task) => (
                <button key={task.id} className="topicCard" type="button" onClick={() => chooseTask(task)}>
                  <span>{task.categoryLabel}</span>
                  <strong>{task.title}</strong>
                  <small>{task.goal}</small>
                  <em>{task.taskType} · {task.role} {"->"} {task.audience} · {task.difficulty}</em>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === "expressions" && (
          <section className="screen slideScreen">
            <ScreenTitle title="本场景可复用表达" subtitle={selectedTask.situation} />
            <div className="sourceNote">
              <strong>{selectedTask.role} {"->"} {selectedTask.audience}</strong>
              <span>{selectedTask.goal}</span>
            </div>
            <div className="modeGrid" aria-label="practice length">
              {(Object.keys(practiceModes) as PracticeMode[]).map((mode) => (
                <button
                  className={practiceMode === mode ? "active" : ""}
                  key={mode}
                  type="button"
                  onClick={() => setPracticeMode(mode)}
                >
                  <strong>{practiceModes[mode].label}</strong>
                  <span>{practiceModes[mode].helper}</span>
                </button>
              ))}
            </div>
            <div className="bandStack">
              {(Object.keys(expressionUseLabels) as ExpressionUse[]).map((use) => (
                <section className="bandPanel" key={use}>
                  <h3>{expressionUseLabels[use]}</h3>
                  {currentExpressions[use].map((item) => (
                    <button
                      className={selectedExpressions.includes(item.phrase) ? "expression selected" : "expression"}
                      key={item.phrase}
                      type="button"
                      onClick={() => toggleExpression(item.phrase)}
                    >
                      <strong>{item.phrase}</strong>
                      <span>{item.example}</span>
                      <small>{item.usage}</small>
                    </button>
                  ))}
                </section>
              ))}
            </div>
            <button className="primaryAction" type="button" onClick={startPractice}>
              开始 {maxTurns} 轮角色扮演 <ChevronRight size={19} />
            </button>
          </section>
        )}

        {step === "practice" && (
          <section className="screen practiceScreen">
            <ScreenTitle title="职场角色扮演" subtitle={`${selectedTask.categoryLabel} · ${selectedTask.title} · ${turn + 1}/${maxTurns}`} />
            <div className="targetRow">
              {selectedExpressions.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div className="coachPanel" aria-live="polite">
              <div className={isSpeaking ? "coachAvatar speaking" : "coachAvatar"}>
                <Volume2 size={24} />
              </div>
              <div>
                <strong>AI Voice Coach</strong>
                <span>{speechStatus}</span>
                <small>{voiceLatencyMs === null ? "首轮启动后会记录语音响应耗时。" : `最近语音响应：${(voiceLatencyMs / 1000).toFixed(1)}s`}</small>
              </div>
              <div className="coachActions">
                <button type="button" onClick={replayLastCoachTurn} disabled={!canSpeak || transcript.every((line) => line.role !== "ai")} aria-label="重听 AI 回复">
                  <Volume2 size={17} />
                </button>
                <button type="button" onClick={stopCoachSpeech} disabled={!isSpeaking} aria-label="停止 AI 语音">
                  <Pause size={17} />
                </button>
              </div>
            </div>
            <div className="chatLog">
              {transcript.map((line, index) => (
                <p className={line.role === "ai" ? "bubble ai" : "bubble user"} key={`${line.role}-${index}`}>
                  {line.text}
                </p>
              ))}
            </div>
            <form className="replyBar" onSubmit={sendReply}>
              <button className={isListening ? "mic listening" : "mic"} type="button" onClick={startVoice} aria-label="voice input">
                <Mic size={19} />
              </button>
              <input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="说一句或输入英文工作回答..." />
              <button type="submit" disabled={isThinking}>
                {isThinking ? <RefreshCw size={19} /> : <Check size={19} />}
              </button>
            </form>
            <p className="statusText">{voiceStatus}</p>
            <p className="statusText">{coachStatus}</p>
          </section>
        )}

        {step === "assessment" && assessment && (
          <section className="screen slideScreen">
            <div className="scorePanel">
              <p className="eyebrow">Workplace practice estimate</p>
              <h2>沟通准备度：{assessment.scoreRange}</h2>
              <strong className="completionLine">{assessment.completionSummary}</strong>
              <p>{coachStatus} {canSave ? "已保存到本地历史记录。" : "当前是游客模式，登录后才会永久保存历史。"}</p>
            </div>
            <div className="feedbackGrid">
              <Feedback title="清晰度" text={assessment.clarity} />
              <Feedback title="自然度" text={assessment.naturalness} />
              <Feedback title="专业语气" text={assessment.professionalTone} />
              <Feedback title="互动能力" text={assessment.interaction} />
              <Feedback title="任务完成" text={assessment.taskCompletion} />
            </div>
            {assessment.sentenceRewrites?.length > 0 && (
              <div className="repeatPanel">
                <h3>原句改写</h3>
                {(assessment.sentenceRewrites as SentenceRewrite[]).slice(0, 3).map((rewrite) => (
                  <div className="rewriteItem" key={`${rewrite.original}-${rewrite.improved}`}>
                    <p><strong>原句：</strong>{rewrite.original}</p>
                    <p><strong>改写：</strong>{rewrite.improved}</p>
                    <small>为什么更适合工作场景：{rewrite.reason}</small>
                  </div>
                ))}
              </div>
            )}
            <div className="repeatPanel">
              <h3>下次真实工作可直接复用</h3>
              {assessment.repeatSentences.map((sentence) => (
                <p key={sentence}>{sentence}</p>
              ))}
            </div>
            <div className="actionRow">
              <button className="secondaryAction" type="button" onClick={startPractice}>
                <RefreshCw size={18} /> 再练一次
              </button>
              <button className="primaryAction compact" type="button" onClick={() => setStep("scenario")}>
                换场景
              </button>
            </div>
          </section>
        )}

        {step === "history" && (
          <section className="screen slideScreen">
            <ScreenTitle title="练习历史" subtitle={account ? "当前账号的隔离历史记录" : "请登录后保存账号历史和记忆"} />
            {account && history.length > 0 && (
              <button
                className="textButton"
                type="button"
                onClick={async () => {
                  const data = await accountMemoryRequest({ action: "deleteHistory", userId: account.id });
                  applyAccountState(data);
                }}
              >
                删除当前账号历史
              </button>
            )}
            <div className="historyList">
              {history.length === 0 && <p className="emptyState">暂无记录。完成一轮职场练习后会显示在这里。</p>}
              {history.map((session) => (
                <article className="historyItem" key={session.id}>
                  <span>{session.categoryLabel} · {new Date(session.createdAt).toLocaleString()}</span>
                  <strong>{session.taskTitle}</strong>
                  <small>{session.scoreRange} · {session.role} · {session.transcript.filter((line) => line.role === "user").length} 条回答</small>
                  <button
                    className="textButton"
                    type="button"
                    onClick={async () => {
                      if (!account) return;
                      const data = await accountMemoryRequest({ action: "deleteSession", userId: account.id, sessionId: session.id });
                      applyAccountState(data);
                    }}
                  >
                    删除这次记录
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function ScreenTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="screenTitle">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function Feedback({ title, text }: { title: string; text: string }) {
  return (
    <article>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
