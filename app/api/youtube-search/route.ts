import { NextRequest, NextResponse } from "next/server";

type SearchResult = {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string;
};

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    return res;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function searchYouTube(query: string): Promise<SearchResult[]> {
  const encoded = encodeURIComponent(query);
  const url = `https://www.youtube.com/results?search_query=${encoded}`;

  const response = await fetchWithTimeout(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`youtube_search_failed: ${response.status}`);
  }

  const html = await response.text();
  const videoIds = new Set<string>();

  const idRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
  let match;
  while ((match = idRegex.exec(html)) !== null) {
    videoIds.add(match[1]);
  }

  const simpleRegex = /watch\?v=([a-zA-Z0-9_-]{11})/g;
  while ((match = simpleRegex.exec(html)) !== null) {
    videoIds.add(match[1]);
  }

  const results: SearchResult[] = [];
  const idArray = [...videoIds].slice(0, 8);

  for (const videoId of idArray) {
    let title = "YouTube Video";
    let channel = "Unknown";

    const titleRegex = new RegExp(`"videoId":"${videoId}"[^}]*?"title":\\{"runs":\\[\\{"text":"((?:[^"\\\\]|\\\\.)*)"`, "s");
    const titleMatch = html.match(titleRegex);
    if (titleMatch) {
      title = titleMatch[1].replace(/\\u0026/g, "&").replace(/\\"/g, '"');
    }

    const channelRegex = new RegExp(`"videoId":"${videoId}"[^}]*?"ownerText":\\{"runs":\\[\\{"text":"((?:[^"\\\\]|\\\\.)*)"`, "s");
    const channelMatch = html.match(channelRegex);
    if (channelMatch) {
      channel = channelMatch[1].replace(/\\u0026/g, "&").replace(/\\"/g, '"');
    }

    if (title === "YouTube Video") {
      try {
        const oembedRes = await fetchWithTimeout(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`, {}, 3000);
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          if (oembedData.title) title = oembedData.title;
          if (oembedData.author_name) channel = oembedData.author_name;
        }
      } catch {}
    }

    results.push({
      videoId,
      title,
      channel,
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      duration: "",
    });
  }

  return results;
}

async function getVideoInfo(videoId: string): Promise<{ title: string; channel: string } | null> {
  try {
    const response = await fetchWithTimeout(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`, {}, 5000);
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

async function fetchTranscriptFromYouTube(videoId: string): Promise<RawTranscriptItem[]> {
  try {
    const response = await fetchWithTimeout(
      `https://www.youtube.com/watch?v=${videoId}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      },
      8000
    );

    if (!response.ok) return [];
    const html = await response.text();

    const captionConfigMatch = html.match(/"captionTracks":(\[.*?\])/);
    if (!captionConfigMatch) return [];

    let captionTracks;
    try {
      captionTracks = JSON.parse(captionConfigMatch[1]);
    } catch {
      return [];
    }

    const englishTrack = captionTracks.find((t: any) =>
      t.languageCode === "en" || t.languageCode === "en-US" || t.languageCode === "en-GB"
    ) || captionTracks[0];

    if (!englishTrack?.baseUrl) return [];

    const transcriptRes = await fetchWithTimeout(englishTrack.baseUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    }, 8000);

    if (!transcriptRes.ok) return [];
    const xml = await transcriptRes.text();

    const items: RawTranscriptItem[] = [];
    const regex = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>(.*?)<\/text>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      const text = match[3]
        .replace(/&amp;amp;/g, "&")
        .replace(/&amp;#39;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&amp;quot;/g, '"')
        .replace(/&quot;/g, '"')
        .replace(/&amp;lt;/g, "<")
        .replace(/&lt;/g, "<")
        .replace(/&amp;gt;/g, ">")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/<[^>]+>/g, "")
        .trim();
      if (text) {
        items.push({
          text,
          duration: parseFloat(match[2]) || 0,
          offset: parseFloat(match[1]) || 0,
        });
      }
    }

    return items;
  } catch (err) {
    console.error("[youtube-search] transcript fetch failed:", String(err).slice(0, 200));
    return [];
  }
}

async function fetchTranscriptFromLibrary(videoId: string): Promise<RawTranscriptItem[]> {
  try {
    const { YoutubeTranscript } = await import("youtube-transcript");
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
    return transcript.map((item: any) => ({
      text: item.text || "",
      duration: item.duration || 0,
      offset: item.offset || 0,
    }));
  } catch (err) {
    console.error("[youtube-search] library fetch failed:", String(err).slice(0, 200));
    return [];
  }
}

async function fetchTranscript(videoId: string): Promise<RawTranscriptItem[]> {
  const items = await fetchTranscriptFromYouTube(videoId);
  if (items.length > 0) return items;

  return await fetchTranscriptFromLibrary(videoId);
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

function extractVocabSimple(text: string): { word: string; meaning: string; phonetic: string }[] {
  const words = text.split(/\s+/).filter((w) => w.length > 6 && /^[a-zA-Z]+$/.test(w));
  const unique = [...new Set(words)].slice(0, 2);
  return unique.map((word) => ({
    word,
    meaning: "",
    phonetic: "",
  }));
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

export const maxDuration = 60;

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

    console.log(`[youtube-search] prepare: videoId=${videoId}`);

    const rawTranscript = await fetchTranscript(videoId);
    console.log(`[youtube-search] transcript items: ${rawTranscript.length}`);

    if (rawTranscript.length === 0) {
      return NextResponse.json({
        ok: false,
        error: "no_transcript",
        message: "无法获取字幕。这个视频可能没有英文字幕，或字幕被禁用。请确认视频有 CC 字幕标识。",
      });
    }

    const merged = mergeTranscriptItems(rawTranscript);
    console.log(`[youtube-search] merged segments: ${merged.length}`);
    const suitability = assessSuitability(merged);

    if (!suitability.suitable) {
      return NextResponse.json({ ok: false, error: "not_suitable", message: suitability.reason });
    }

    const segments = merged.map((item, index) => ({
      id: index,
      start: Math.floor(item.start),
      duration: Math.ceil(item.duration),
      text: item.text,
      vocab: extractVocabSimple(item.text),
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
        description: `来自 ${channel} · AI 已分段标注`,
        transcript: segments,
      },
      suitability: suitability.reason,
    });
  }

  return NextResponse.json({ ok: false, error: "invalid_action" });
}
