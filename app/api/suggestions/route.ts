import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const SUGGESTIONS_FILE = path.join(process.cwd(), "data", "suggestions.json");

type Suggestion = {
  id: string;
  nickname: string;
  content: string;
  scenario: string;
  createdAt: string;
  likes: number;
};

async function readSuggestions(): Promise<Suggestion[]> {
  try {
    const data = await fs.readFile(SUGGESTIONS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeSuggestions(data: Suggestion[]) {
  await fs.mkdir(path.dirname(SUGGESTIONS_FILE), { recursive: true });
  await fs.writeFile(SUGGESTIONS_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  const suggestions = await readSuggestions();
  return NextResponse.json({ ok: true, suggestions: suggestions.slice(0, 100) });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const action = body.action as "add" | "like";

  if (action === "add") {
    const content = (body.content as string)?.trim();
    if (!content || content.length > 500) {
      return NextResponse.json({ ok: false, error: "invalid_content" });
    }

    const suggestions = await readSuggestions();
    const newSuggestion: Suggestion = {
      id: `sug-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nickname: (body.nickname as string)?.trim().slice(0, 30) || "匿名用户",
      content,
      scenario: (body.scenario as string)?.trim().slice(0, 50) || "其他",
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    suggestions.unshift(newSuggestion);
    await writeSuggestions(suggestions);

    return NextResponse.json({ ok: true, suggestion: newSuggestion });
  }

  if (action === "like") {
    const id = body.id as string;
    const suggestions = await readSuggestions();
    const target = suggestions.find((s) => s.id === id);
    if (!target) {
      return NextResponse.json({ ok: false, error: "not_found" });
    }

    const likedKey = `speakloop:liked_${id}`;
    const alreadyLiked = body.alreadyLiked === true;

    if (alreadyLiked) {
      target.likes = Math.max(0, target.likes - 1);
    } else {
      target.likes += 1;
    }

    await writeSuggestions(suggestions);
    return NextResponse.json({ ok: true, likes: target.likes });
  }

  return NextResponse.json({ ok: false, error: "invalid_action" });
}
