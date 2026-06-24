import { NextRequest, NextResponse } from "next/server";

type Role = "ai" | "user";

type TranscriptLine = {
  role: Role;
  text: string;
};

const fallbackAssessment = {
  scoreRange: "Developing",
  completionSummary: "这轮部分完成了工作沟通目标：主要问题说清楚了，但下一步和责任边界还需要更具体。",
  clarity: "你能表达主要意思，但需要把背景、问题、下一步分得更清楚。",
  naturalness: "表达可理解；下一步要减少直译，多使用真实工作场景里的短句。",
  professionalTone: "语气基本礼貌；可以加入缓冲表达，让不同意见听起来更专业。",
  interaction: "目前更像单向回答；建议主动确认对方问题，并给出 follow-up。",
  taskCompletion: "建议明确 owner、deadline 或 next step，这样更像真实工作沟通。",
  sentenceRewrites: [
    {
      original: "I cannot finish it on time.",
      improved: "We are running into a delay, and I suggest we adjust the timeline to protect quality.",
      reason: "The rewrite explains the issue and proposes a next step instead of only reporting a problem."
    }
  ],
  repeatSentences: [
    "I want to flag a potential risk and suggest a practical next step.",
    "Just to make sure I understand correctly, the main concern is the timeline, right?",
    "For the next real meeting, say: The next step I suggest is to confirm the owner and follow up by the end of today."
  ]
};

function jsonFallback(action: string) {
  if (action === "assessment") {
    return NextResponse.json({ ok: false, source: "fallback", assessment: fallbackAssessment });
  }

  return NextResponse.json({
    ok: false,
    source: "fallback",
    nextQuestion:
      "I will stay in role: can you explain the main issue, the business impact, and the next step you recommend?",
    suggestion: "Try: I want to flag a potential risk, and the next step I suggest is..."
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return jsonFallback(body.action);
  }

  const action = String(body.action ?? "dialogue");
  const transcript = (body.transcript ?? []) as TranscriptLine[];
  const targetExpressions = Array.isArray(body.targetExpressions) ? body.targetExpressions.join("; ") : "";
  const task = body.task ?? body.topic ?? {};
  const profile = body.profile ?? {};
  const memory = body.memory ?? null;
  const memoryContext = memory
    ? `User memory summary: ${memory.summary ?? ""}
Recurring weaknesses: ${JSON.stringify(memory.recurringWeaknesses ?? [])}
Recommended reason: ${memory.recommendedReason ?? ""}
Saved phrases: ${JSON.stringify(memory.savedPhrases ?? [])}`
    : "No stored user memory yet.";

  const workplaceRubric = `
Assess workplace speaking for practical communication, not exam scoring:
- Clarity: whether the listener can quickly understand the point.
- Naturalness: whether the wording sounds like real workplace English, not direct translation.
- Professional tone: whether the user is polite, specific, and not too blunt or vague.
- Interaction: whether the user responds, clarifies, asks, confirms, and keeps the conversation moving.
- Task completion: whether the user completes the stated workplace goal, such as explaining a delay, confirming requirements, or proposing a next step.
All outputs are practice estimates only.
`;

  const system =
    action === "assessment"
      ? "You are a workplace English speaking coach. Return strict JSON only. Assess practical workplace communication. Cite the user's transcript, rewrite concrete sentences, and judge task completion. Do not behave like an IELTS/TOEFL examiner."
      : "You are role-playing a workplace conversation. Return strict JSON only. Stay in the assigned workplace role, keep the user focused on the task goal, ask one realistic follow-up, and teach one concise expression or correction.";

  const user =
    action === "assessment"
      ? `Assess this workplace speaking practice.
Task title: ${task.title}
Scenario: ${task.categoryLabel ?? task.category}
User role: ${task.role}
AI role/audience: ${task.audience}
Task goal: ${task.goal}
Context: ${task.situation}
Success criteria: ${JSON.stringify(task.successCriteria ?? [])}
User profile: ${JSON.stringify(profile)}
Memory context: ${memoryContext}
Target expressions: ${targetExpressions}
Transcript: ${JSON.stringify(transcript)}
Rubric:
${workplaceRubric}

Return JSON:
{
  "scoreRange": "Workplace-ready | Developing | Needs structure",
  "completionSummary": "one sentence saying whether the user completed the workplace communication goal",
  "clarity": "short feedback with transcript evidence and one fix",
  "naturalness": "short feedback with transcript evidence and one more natural wording",
  "professionalTone": "short feedback with evidence and one tone fix",
  "interaction": "short feedback about response/clarification/follow-up behavior",
  "taskCompletion": "judge whether the task goal was completed and what was missing",
  "sentenceRewrites": [
    {
      "original": "one exact or near-exact user sentence from transcript",
      "improved": "more natural/professional rewrite",
      "reason": "why the rewrite works in workplace context"
    }
  ],
  "repeatSentences": ["three reusable workplace sentences for next practice"]
}`
      : `Continue this workplace role play.
Task title: ${task.title}
Scenario: ${task.categoryLabel ?? task.category}
User role: ${task.role}
Your role/audience: ${task.audience}
Task goal: ${task.goal}
Context: ${task.situation}
Success criteria: ${JSON.stringify(task.successCriteria ?? [])}
User profile: ${JSON.stringify(profile)}
Memory context: ${memoryContext}
Target expressions: ${targetExpressions}
Transcript: ${JSON.stringify(transcript)}

Rules:
- Stay in your workplace role. Do not switch into a generic teacher unless giving the short suggestion field.
- If the user drifts away from the task goal, pull them back politely.
- Ask one realistic follow-up that a ${task.audience ?? "workplace counterpart"} would ask.
- The suggestion must be one concrete correction or reusable phrase for this exact scenario.
- If memory context exists, adapt the follow-up or suggestion to the user's recurring weakness.

Return JSON:
{
  "nextQuestion": "one role-play follow-up question",
  "suggestion": "one concrete expression or correction the user can use next"
}`;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
        temperature: 0.65,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ]
      })
    });

    if (!response.ok) {
      return jsonFallback(action);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    if (action === "assessment") {
      return NextResponse.json({ ok: true, source: "deepseek", assessment: parsed });
    }

    return NextResponse.json({ ok: true, source: "deepseek", ...parsed });
  } catch {
    return jsonFallback(action);
  }
}
