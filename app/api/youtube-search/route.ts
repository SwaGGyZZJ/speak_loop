import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

type SearchResult = {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string;
};

async function searchYouTube(query: string): Promise<SearchResult[]> {
  const encoded = encodeURIComponent(query);
  const url = `https://www.youtube.com/results?search_query=${encoded}&sp=EgIQAQ%253D%253D`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`youtube_search_failed: ${response.status}`);
  }

  const html = await response.text();
  const results: SearchResult[] = [];

  const patterns = [
    /"videoRenderer":\{"videoId":"([^"]+)"[^}]*?"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"[^}]*?\][^}]*?"ownerText"?:?\{?"runs"?:?\[?\{?"text"?:?"((?:[^"\\]|\\.)*)"/g,
    /"videoId":"([^"]{11})"[^}]*?"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/g,
    /watch\?v=([^"&]{11})[^"]*"[^}]*"title":\{"simpleText":"((?:[^"\\]|\\.)*)"/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const videoId = match[1];
      const title = (match[2] || "").replace(/\\u0026/g, "&").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
      const channel = (match[3] || "Unknown").replace(/\\u0026/g, "&").replace(/\\"/g, '"');

      if (videoId && videoId.length === 11 && !results.find((r) => r.videoId === videoId)) {
        results.push({
          videoId,
          title: title || "Untitled",
          channel,
          thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          duration: "",
        });
      }
      if (results.length >= 12) break;
    }
    if (results.length >= 12) break;
  }

  if (results.length === 0) {
    const simpleMatches = html.match(/watch\?v=([a-zA-Z0-9_-]{11})/g);
    if (simpleMatches) {
      const seen = new Set<string>();
      for (const m of simpleMatches) {
        const id = m.replace("watch?v=", "");
        if (!seen.has(id) && id.length === 11) {
          seen.add(id);
          results.push({
            videoId: id,
            title: "YouTube Video",
            channel: "Unknown",
            thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
            duration: "",
          });
        }
        if (results.length >= 12) break;
      }
    }
  }

  return results;
}

async function getVideoInfo(videoId: string): Promise<{ title: string; channel: string } | null> {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (response.ok) {
      const data = await response.json();
      return { title: data.title || "YouTube Video", channel: data.author_name || "Unknown" };
    }
  } catch {}
  return null;
}

type RawTranscriptItem = {
  text: string;
  duration: number;
  offset: number;
};

async function fetchTranscript(videoId: string): Promise<RawTranscriptItem[]> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
    return transcript.map((item: any) => ({
      text: item.text || "",
      duration: item.duration || 0,
      offset: item.offset || 0,
    }));
  } catch {
    return [];
  }
}

function mergeTranscriptItems(items: RawTranscriptItem[]): { text: string; start: number; duration: number }[] {
  const merged: { text: string; start: number; duration: number }[] = [];
  let current = "";

  for (const item of items) {
    current += (current ? " " : "") + item.text.trim();
    if (current.endsWith(".") || current.endsWith("!") || current.endsWith("?") || current.length > 120) {
      const start = merged.length > 0
        ? merged[merged.length - 1].start + merged[merged.length - 1].duration
        : item.offset;
      merged.push({ text: current, start, duration: item.duration });
      current = "";
    }
  }
  if (current.trim()) {
    const start = merged.length > 0
      ? merged[merged.length - 1].start + merged[merged.length - 1].duration
      : 0;
    merged.push({ text: current, start, duration: 5 });
  }
  return merged;
}

function assessSuitability(transcript: { text: string; start: number; duration: number }[]): { suitable: boolean; reason: string; level: string } {
  const allText = transcript.map((s) => s.text).join(" ");
  const wordCount = allText.split(/\s+/).filter(Boolean).length;

  if (transcript.length < 3) {
    return { suitable: false, reason: "字幕太少，可能没有英文字幕或视频太短。", level: "" };
  }
  if (wordCount < 20) {
    return { suitable: false, reason: "内容太短，不适合跟读练习。", level: "" };
  }

  const nonEnglishRatio = (allText.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) || []).length / Math.max(1, wordCount);
  if (nonEnglishRatio > 0.3) {
    return { suitable: false, reason: "字幕以非英语为主，不适合英语跟读。", level: "" };
  }

  const avgSentenceLen = wordCount / transcript.length;
  const level = avgSentenceLen > 15 ? "B2-C1" : avgSentenceLen > 8 ? "B1-B2" : "A2-A1";

  return { suitable: true, reason: `适合跟读！约 ${wordCount} 词，${transcript.length} 句，预估水平 ${level}。`, level };
}

async function generateVocabWithAI(segments: { text: string }[]) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;

  const sentences = segments.slice(0, 15).map((s, i) => `${i + 1}. ${s.text}`).join("\n");

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are an English learning assistant. Return strict JSON only. For each sentence, extract 0-2 key vocabulary words worth learning.",
          },
          {
            role: "user",
            content: `Extract vocabulary from these sentences. For each sentence number, list key words with meaning (in Chinese) and phonetic transcription.

Sentences:
${sentences}

Return JSON:
{
  "vocab": {
    "1": [{"word": "...", "meaning": "中文释义", "phonetic": "/.../"}],
    "2": [...],
    ...
  }
}`,
          },
        ],
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function extractVideoId(input: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const match = input.match(p);
    if (match) return match[1];
  }
  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const action = body.action as "search" | "prepare";

  if (action === "search") {
    const query = (body.query as string)?.trim();
    if (!query) {
      return NextResponse.json({ ok: false, error: "no_query" });
    }

    const directId = extractVideoId(query);
    if (directId) {
      const info = await getVideoInfo(directId);
      return NextResponse.json({
        ok: true,
        results: [
          {
            videoId: directId,
            title: info?.title || "YouTube Video",
            channel: info?.channel || "Unknown",
            thumbnail: `https://img.youtube.com/vi/${directId}/mqdefault.jpg`,
            duration: "",
          },
        ],
      });
    }

    try {
      const results = await searchYouTube(query);
      if (results.length === 0) {
        return NextResponse.json({
          ok: false,
          error: "no_results",
          message: "没搜到视频。你也可以直接粘贴 YouTube 视频链接到搜索框。",
        });
      }
      return NextResponse.json({ ok: true, results });
    } catch (err) {
      return NextResponse.json({
        ok: false,
        error: "search_failed",
        message: `搜索失败：${String(err).slice(0, 100)}。你也可以直接粘贴 YouTube 视频链接。`,
      });
    }
  }

  if (action === "prepare") {
    const videoId = (body.videoId as string)?.trim();
    const title = (body.title as string) || "Custom Video";
    const channel = (body.channel as string) || "";

    if (!videoId) {
      return NextResponse.json({ ok: false, error: "no_video_id" });
    }

    const rawTranscript = await fetchTranscript(videoId);
    if (rawTranscript.length === 0) {
      return NextResponse.json({
        ok: false,
        error: "no_transcript",
        message: "无法获取字幕。可能原因：视频没有英文字幕、字幕被禁用、或视频不存在。",
      });
    }

    const merged = mergeTranscriptItems(rawTranscript);
    const suitability = assessSuitability(merged);

    if (!suitability.suitable) {
      return NextResponse.json({ ok: false, error: "not_suitable", message: suitability.reason });
    }

    let vocabMap: Record<string, any[]> | null = null;
    try {
      const aiResult = await generateVocabWithAI(merged);
      if (aiResult?.vocab) {
        vocabMap = aiResult.vocab;
      }
    } catch {}

    const segments = merged.map((item, index) => ({
      id: index,
      start: Math.floor(item.start),
      duration: Math.ceil(item.duration),
      text: item.text,
      vocab: vocabMap?.[String(index + 1)] || [],
    }));

    return NextResponse.json({
      ok: true,
      video: {
        id: `custom-${videoId}`,
        title,
        titleZh: "",
        category: "custom" as const,
        categoryLabel: "自定义",
        level: suitability.level.split("-")[0] as "A2" | "B1" | "B2" | "C1",
        source: "youtube" as const,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        duration: `${Math.ceil(segments[segments.length - 1].start / 60)}:${String(Math.ceil(segments[segments.length - 1].start % 60)).padStart(2, "0")}`,
        description: `来自 ${channel} 的 YouTube 视频`,
        transcript: segments,
      },
      suitability: suitability.reason,
    });
  }

  return NextResponse.json({ ok: false, error: "invalid_action" });
}
