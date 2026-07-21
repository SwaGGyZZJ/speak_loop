import { NextRequest, NextResponse } from "next/server";

type SearchResult = {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string;
  hasCaption: boolean;
  captionUrl?: string;
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

type ParsedVideo = {
  videoId: string;
  title: string;
  channel: string;
  hasCaption: boolean;
  captionTracks?: any[];
};

function parseYouTubeSearchHTML(html: string): ParsedVideo[] {
  const videos: ParsedVideo[] = [];
  const seen = new Set<string>();

  const videoRendererRegex = /"videoRenderer":\{("videoId":"[a-zA-Z0-9_-]{11}".*?)(?="videoRenderer"|"compactVideoRenderer"|"shelfRenderer"|\}\]\})/gs;

  let match;
  while ((match = videoRendererRegex.exec(html)) !== null) {
    const block = match[1];

    const idMatch = block.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (!idMatch) continue;
    const videoId = idMatch[1];
    if (seen.has(videoId)) continue;
    seen.add(videoId);

    let title = "YouTube Video";
    const titleMatch = block.match(/"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/);
    if (titleMatch) {
      title = titleMatch[1].replace(/\\u0026/g, "&").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    }

    let channel = "Unknown";
    const channelMatch = block.match(/"ownerText":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/);
    if (channelMatch) {
      channel = channelMatch[1].replace(/\\u0026/g, "&").replace(/\\"/g, '"');
    } else {
      const channelMatch2 = block.match(/"shortBylineText":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/);
      if (channelMatch2) {
        channel = channelMatch2[1].replace(/\\u0026/g, "&").replace(/\\"/g, '"');
      }
    }

    let hasCaption = false;
    if (block.includes('"caption"')) {
      hasCaption = true;
    }
    if (block.includes('"captionTracks"')) {
      hasCaption = true;
    }

    let duration = "";
    const durMatch = block.match(/"lengthText":\{"simpleText":"([^"]*)"/);
    if (durMatch) {
      duration = durMatch[1];
    }

    videos.push({ videoId, title, channel, hasCaption });
  }

  if (videos.length === 0) {
    const idRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
    while ((match = idRegex.exec(html)) !== null) {
      const videoId = match[1];
      if (!seen.has(videoId)) {
        seen.add(videoId);
        videos.push({ videoId, title: "YouTube Video", channel: "Unknown", hasCaption: false });
      }
    }
  }

  return videos;
}

async function checkCaptionAndEnrich(videoId: string): Promise<{ hasCaption: boolean; captionUrl?: string; title?: string; channel?: string }> {
  try {
    const response = await fetchWithTimeout(
      `https://www.youtube.com/watch?v=${videoId}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      },
      6000
    );

    if (!response.ok) return { hasCaption: false };
    const html = await response.text();

    let title: string | undefined;
    let channel: string | undefined;
    const ogTitle = html.match(/<meta property="og:title" content="([^"]*)"/);
    if (ogTitle) title = ogTitle[1];
    const ogChannel = html.match(/"author":"([^"]*)"/);
    if (ogChannel) channel = ogChannel[1];

    const captionConfigMatch = html.match(/"captionTracks":(\[.*?\])/);
    if (!captionConfigMatch) {
      return { hasCaption: false, title, channel };
    }

    let captionTracks;
    try {
      captionTracks = JSON.parse(captionConfigMatch[1]);
    } catch {
      return { hasCaption: false, title, channel };
    }

    const englishTrack = captionTracks.find((t: any) =>
      t.languageCode === "en" || t.languageCode === "en-US" || t.languageCode === "en-GB"
    ) || captionTracks.find((t: any) => t.kind !== "asr") || captionTracks[0];

    if (!englishTrack?.baseUrl) {
      return { hasCaption: false, title, channel };
    }

    return { hasCaption: true, captionUrl: englishTrack.baseUrl, title, channel };
  } catch {
    return { hasCaption: false };
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
  const parsed = parseYouTubeSearchHTML(html);

  const results: SearchResult[] = [];
  const topVideos = parsed.slice(0, 6);

  await Promise.all(topVideos.map(async (v) => {
    let title = v.title;
    let channel = v.channel;
    let hasCaption = v.hasCaption;
    let captionUrl: string | undefined;

    const enrich = await checkCaptionAndEnrich(v.videoId);
    if (enrich.title) title = enrich.title;
    if (enrich.channel) channel = enrich.channel;
    hasCaption = enrich.hasCaption;
    captionUrl = enrich.captionUrl;

    if (title === "YouTube Video") {
      try {
        const oembedRes = await fetchWithTimeout(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${v.videoId}`, {}, 3000);
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          if (oembedData.title) title = oembedData.title;
          if (oembedData.author_name) channel = oembedData.author_name;
        }
      } catch {}
    }

    results.push({
      videoId: v.videoId,
      title,
      channel,
      thumbnail: `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`,
      duration: "",
      hasCaption,
      captionUrl,
    });
  }));

  const withoutCaption = parsed.slice(6, 10).map(v => ({
    videoId: v.videoId,
    title: v.title,
    channel: v.channel,
    thumbnail: `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`,
    duration: "",
    hasCaption: false,
  }));

  return [...results, ...withoutCaption];
}

async function getVideoInfo(videoId: string): Promise<SearchResult | null> {
  const enrich = await checkCaptionAndEnrich(videoId);
  let title = enrich.title || "YouTube Video";
  let channel = enrich.channel || "Unknown";

  if (title === "YouTube Video") {
    try {
      const oembedRes = await fetchWithTimeout(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`, {}, 5000);
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        title = data.title || title;
        channel = data.author_name || channel;
      }
    } catch {}
  }

  return {
    videoId,
    title,
    channel,
    thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    duration: "",
    hasCaption: enrich.hasCaption,
    captionUrl: enrich.captionUrl,
  };
}

type RawTranscriptItem = {
  text: string;
  duration: number;
  offset: number;
};

function parseTranscriptXML(xml: string): RawTranscriptItem[] {
  const items: RawTranscriptItem[] = [];
  const regex = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>(.*?)<\/text>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const text = match[3]
      .replace(/&amp;#39;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&amp;quot;/g, '"')
      .replace(/&quot;/g, '"')
      .replace(/&amp;lt;/g, "<")
      .replace(/&lt;/g, "<")
      .replace(/&amp;gt;/g, ">")
      .replace(/&gt;/g, ">")
      .replace(/&amp;amp;/g, "&")
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
    return { suitable: false, reason: "字幕太少，视频太短。", level: "" };
  }
  if (wordCount < 20) {
    return { suitable: false, reason: "内容太短。", level: "" };
  }

  const nonEnglishRatio = (allText.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) || []).length / Math.max(1, wordCount);
  if (nonEnglishRatio > 0.3) {
    return { suitable: false, reason: "字幕非英语为主。", level: "" };
  }

  const avgSentenceLen = wordCount / transcript.length;
  const level = avgSentenceLen > 15 ? "B2-C1" : avgSentenceLen > 8 ? "B1-B2" : "A2-A1";
  return { suitable: true, reason: `${wordCount} 词, ${transcript.length} 句, ${level}`, level };
}

function extractVocabSimple(text: string): { word: string; meaning: string; phonetic: string }[] {
  const words = text.split(/\s+/).filter((w) => w.length > 6 && /^[a-zA-Z]+$/.test(w));
  return [...new Set(words)].slice(0, 2).map((word) => ({ word, meaning: "", phonetic: "" }));
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
      if (info) {
        return NextResponse.json({ ok: true, results: [info] });
      }
      return NextResponse.json({
        ok: false,
        error: "no_results",
        message: "无法获取视频信息，请检查链接是否正确。",
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

      const withCaptions = results.filter((r) => r.hasCaption);
      const withoutCaptions = results.filter((r) => !r.hasCaption);

      return NextResponse.json({
        ok: true,
        results,
        withCaptions: withCaptions.length,
        withoutCaptions: withoutCaptions.length,
      });
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
    const captionUrl = (body.captionUrl as string) || "";

    if (!videoId) {
      return NextResponse.json({ ok: false, error: "no_video_id" });
    }

    console.log(`[youtube-search] prepare: videoId=${videoId}, hasCaptionUrl=${!!captionUrl}`);

    let rawItems: RawTranscriptItem[] = [];

    if (captionUrl) {
      try {
        const transcriptRes = await fetchWithTimeout(captionUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
        }, 8000);

        if (transcriptRes.ok) {
          const xml = await transcriptRes.text();
          rawItems = parseTranscriptXML(xml);
          console.log(`[youtube-search] transcript from captionUrl: ${rawItems.length} items`);
        }
      } catch (err) {
        console.error("[youtube-search] captionUrl fetch failed:", String(err).slice(0, 200));
      }
    }

    if (rawItems.length === 0) {
      const enrich = await checkCaptionAndEnrich(videoId);
      if (enrich.captionUrl) {
        try {
          const transcriptRes = await fetchWithTimeout(enrich.captionUrl, {
            headers: { "User-Agent": "Mozilla/5.0" },
          }, 8000);

          if (transcriptRes.ok) {
            const xml = await transcriptRes.text();
            rawItems = parseTranscriptXML(xml);
            console.log(`[youtube-search] transcript from enrich: ${rawItems.length} items`);
          }
        } catch (err) {
          console.error("[youtube-search] enrich captionUrl fetch failed:", String(err).slice(0, 200));
        }
      }
    }

    if (rawItems.length === 0) {
      return NextResponse.json({
        ok: false,
        error: "no_transcript",
        message: "无法获取字幕。请确认视频有 CC 字幕标识。",
      });
    }

    const merged = mergeTranscriptItems(rawItems);
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
        description: `来自 ${channel}`,
        transcript: segments,
      },
      suitability: suitability.reason,
    });
  }

  return NextResponse.json({ ok: false, error: "invalid_action" });
}
