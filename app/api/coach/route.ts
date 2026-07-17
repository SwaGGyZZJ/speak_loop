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

  if (action === "ielts-assessment") {
    return NextResponse.json({ ok: false, source: "fallback" });
  }

  if (action === "ielts-dialogue") {
    return NextResponse.json({
      ok: false,
      source: "fallback",
      nextQuestion: "Can you tell me more about that? What made it memorable for you?",
      suggestion: "Try to use a specific example and explain your feelings about it."
    });
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

  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

  const action = String(body.action ?? "dialogue");
  const isIELTS = action === "ielts-dialogue" || action === "ielts-assessment";
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

  const ieltsRubric = `
Assess IELTS Speaking using the official band descriptors (bands 5-9) across four criteria:
- Fluency & Coherence: speech rate, willingness to talk, topic development, cohesive devices, logical flow
- Lexical Resource: vocabulary range, precision, paraphrase, idiomatic language, collocations
- Grammatical Range & Accuracy: variety of structures (simple/compound/complex), error frequency, tense variety
- Pronunciation: individual sounds, word/sentence stress, intonation, chunking, ease of understanding
Each criterion is scored on band 5-9. Overall band is the average rounded to nearest 0.5.
`;

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
    action === "ielts-assessment"
      ? "You are an IELTS Speaking examiner. Return strict JSON only. Assess using official IELTS band descriptors (bands 5-9). Cite transcript evidence for each criterion. Provide specific, actionable improvement tips."
      : action === "ielts-dialogue"
        ? "You are an IELTS Speaking examiner conducting a practice test. Return strict JSON only. Ask natural follow-up questions appropriate to the IELTS part being practiced. Keep the conversation flowing like a real test."
        : action === "assessment"
          ? "You are a workplace English speaking coach. Return strict JSON only. Assess practical workplace communication. Cite the user's transcript, rewrite concrete sentences, and judge task completion. Do not behave like an IELTS/TOEFL examiner."
          : "You are role-playing a workplace conversation. Return strict JSON only. Stay in the assigned workplace role, keep the user focused on the task goal, ask one realistic follow-up, and teach one concise expression or correction.";

  const ieltsAssessmentPrompt = `Assess this IELTS Speaking practice.
IELTS Part: ${body.ieltsPart ?? 2}
Cue card / topic: ${JSON.stringify(task)}
User profile: ${JSON.stringify(profile)}
Transcript: ${JSON.stringify(transcript)}
Rubric:
${ieltsRubric}

Return JSON:
{
  "overallBand": 5 | 6 | 7 | 8 | 9,
  "criteria": [
    { "key": "fluency", "label": "流利度与连贯性", "labelEn": "Fluency & Coherence", "band": 5-9, "feedback": "specific feedback with transcript evidence" },
    { "key": "vocabulary", "label": "词汇资源", "labelEn": "Lexical Resource", "band": 5-9, "feedback": "specific feedback with transcript evidence" },
    { "key": "grammar", "label": "语法范围与准确性", "labelEn": "Grammatical Range & Accuracy", "band": 5-9, "feedback": "specific feedback with transcript evidence" },
    { "key": "pronunciation", "label": "发音", "labelEn": "Pronunciation", "band": 5-9, "feedback": "assessment based on text patterns, noting that actual pronunciation needs audio" }
  ],
  "summary": "overall assessment in 2-3 sentences",
  "strengths": ["2-3 specific strengths with evidence"],
  "weaknesses": ["2-3 specific weaknesses with evidence"],
  "suggestions": ["3-4 actionable tips to improve to the next band"],
  "sentenceRewrites": [
    { "original": "exact user sentence", "improved": "band-improved version", "reason": "why it's better for IELTS" }
  ]
}`;

  const ieltsDialoguePrompt = `Continue this IELTS Speaking practice.
IELTS Part: ${body.ieltsPart ?? 2}
Topic: ${JSON.stringify(task)}
Transcript: ${JSON.stringify(transcript)}

Rules:
- Act as an IELTS examiner. Ask natural follow-up questions.
- For Part 1: ask about familiar topics, keep it conversational.
- For Part 2: if the user hasn't covered all cue card points, gently prompt them.
- For Part 3: ask abstract, analytical questions related to the Part 2 topic.
- Give one suggestion for improvement after each exchange.

Return JSON:
{
  "nextQuestion": "examiner's next question or prompt",
  "suggestion": "one specific tip for the user"
}`;

  const user =
    action === "ielts-assessment"
      ? ieltsAssessmentPrompt
      : action === "ielts-dialogue"
        ? ieltsDialoguePrompt
        : action === "assessment"
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
        model,
        temperature: 0.65,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "unreadable");
      console.error("[coach] DeepSeek API error:", response.status, errorText);
      return NextResponse.json({ ok: false, source: "fallback", error: `deepseek_${response.status}`, detail: errorText.slice(0, 200) });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      console.error("[coach] DeepSeek returned no content:", JSON.stringify(data).slice(0, 300));
      return NextResponse.json({ ok: false, source: "fallback", error: "no_content" });
    }
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("[coach] DeepSeek returned non-JSON content:", content.slice(0, 300));
      return NextResponse.json({ ok: false, source: "fallback", error: "parse_failed", content: content.slice(0, 200) });
    }

    if (action === "assessment") {
      return NextResponse.json({ ok: true, source: "deepseek", assessment: parsed });
    }

    if (action === "ielts-assessment") {
      return NextResponse.json({ ok: true, source: "deepseek", assessment: parsed });
    }

    return NextResponse.json({ ok: true, source: "deepseek", ...parsed });
  } catch (err) {
    console.error("[coach] fetch error:", err);
    return NextResponse.json({ ok: false, source: "fallback", error: "fetch_error", detail: String(err).slice(0, 200) });
  }
}
