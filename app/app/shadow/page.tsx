"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  GraduationCap,
  History,
  Lightbulb,
  Loader2,
  Mic,
  Pause,
  Play,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Volume2,
  Wand2,
} from "lucide-react";
import { shadowVideos, shadowCategories, type ShadowVideo, type TranscriptSegment } from "../../../lib/shadow/videos";

type ShadowMode = "browse" | "practice";
type PracticeMode = "sentence" | "full";

type SearchResult = {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string;
};

export default function ShadowPage() {
  const [mode, setMode] = useState<ShadowMode>("browse");
  const [category, setCategory] = useState<string>("all");
  const [selectedVideo, setSelectedVideo] = useState<ShadowVideo | null>(null);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("sentence");
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState("");
  const [aiScore, setAiScore] = useState<{ score: number; feedback: string } | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [savedVocab, setSavedVocab] = useState<{ word: string; meaning: string; videoTitle: string }[]>([]);
  const [usageRemaining, setUsageRemaining] = useState(5);
  const [userId, setUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [preparingVideoId, setPreparingVideoId] = useState<string | null>(null);
  const [customVideos, setCustomVideos] = useState<ShadowVideo[]>([]);

  const playerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const id = localStorage.getItem("speakloop:anonId") || `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("speakloop:anonId", id);
    setUserId(id);

    fetch("/api/usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get", userId: id }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.remaining !== undefined) setUsageRemaining(d.remaining); })
      .catch(() => {});

    const saved = localStorage.getItem("speakloop:shadowVocab");
    if (saved) {
      try { setSavedVocab(JSON.parse(saved)); } catch {}
    }

    const customSaved = localStorage.getItem("speakloop:customVideos");
    if (customSaved) {
      try { setCustomVideos(JSON.parse(customSaved)); } catch {}
    }

    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (Recognition) {
      const rec = new Recognition();
      rec.lang = "en-US";
      rec.continuous = false;
      rec.interimResults = false;
      rec.onresult = (e: any) => {
        setRecordedText(e.results[0][0].transcript);
        setIsRecording(false);
      };
      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);
      recognitionRef.current = rec;
    }
  }, []);

  const filteredVideos = category === "all" ? shadowVideos : shadowVideos.filter((v) => v.category === category);

  function startPractice(video: ShadowVideo) {
    setSelectedVideo(video);
    setCurrentSegment(0);
    setMode("practice");
  }

  async function searchYouTube() {
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearching(true);
    setSearchError("");
    setSearchResults([]);
    try {
      const res = await fetch("/api/youtube-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search", query: q }),
      });
      const data = await res.json();
      if (data.ok && data.results) {
        setSearchResults(data.results);
      } else {
        setSearchError(data.message || "搜索失败，请重试。");
      }
    } catch {
      setSearchError("网络错误，无法搜索。");
    }
    setIsSearching(false);
  }

  async function prepareVideo(result: SearchResult) {
    setPreparingVideoId(result.videoId);
    try {
      const res = await fetch("/api/youtube-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "prepare",
          videoId: result.videoId,
          title: result.title,
          channel: result.channel,
        }),
      });
      const data = await res.json();
      if (data.ok && data.video) {
        const updated = [data.video, ...customVideos];
        setCustomVideos(updated);
        localStorage.setItem("speakloop:customVideos", JSON.stringify(updated));
        startPractice(data.video);
      } else {
        setSearchError(data.message || "无法生成跟读模板。");
      }
    } catch {
      setSearchError("网络错误，无法生成模板。");
    }
    setPreparingVideoId(null);
  }

  function getYouTubeId(url: string): string {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : "";
  }

  function playSegment(seg: TranscriptSegment) {
    const id = getYouTubeId(selectedVideo?.url ?? "");
    if (!id || !playerRef.current) return;
    playerRef.current.innerHTML = `<iframe width="100%" height="240" src="https://www.youtube.com/embed/${id}?start=${Math.floor(seg.start)}&end=${Math.floor(seg.start + seg.duration)}&autoplay=1&rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    setIsPlaying(true);
  }

  function startRecording() {
    if (!recognitionRef.current) return;
    setRecordedText("");
    setAiScore(null);
    setIsRecording(true);
    recognitionRef.current.start();
  }

  function stopRecording() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  }

  async function scoreRecording(originalText: string) {
    if (!recordedText.trim()) return;
    setIsScoring(true);
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ielts-dialogue",
          task: { topic: "shadowing" },
          transcript: [
            { role: "ai", text: originalText },
            { role: "user", text: recordedText },
          ],
        }),
      });
      const data = await response.json();

      await fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "increment", userId, usageType: "shadow" }),
      }).then((r) => r.json()).then((d) => { if (d.remaining !== undefined) setUsageRemaining(d.remaining); });

      if (data.source === "deepseek" && data.suggestion) {
        setAiScore({ score: 0, feedback: data.suggestion });
      } else {
        const similarity = calculateSimilarity(originalText.toLowerCase(), recordedText.toLowerCase());
        const score = Math.round(similarity * 100);
        const feedback = similarity > 0.85
          ? "发音和语调很接近原文！继续保持。"
          : similarity > 0.65
            ? "基本正确，注意个别单词的发音和连读。"
            : "有些单词可能读错了，建议多听几遍原文再试。";
        setAiScore({ score, feedback });
      }
    } catch {
      const similarity = calculateSimilarity(originalText.toLowerCase(), recordedText.toLowerCase());
      setAiScore({ score: Math.round(similarity * 100), feedback: "AI 评分不可用，使用本地文本相似度对比。" });
    }
    setIsScoring(false);
  }

  function calculateSimilarity(a: string, b: string): number {
    const wordsA = a.split(/\s+/).filter(Boolean);
    const wordsB = b.split(/\s+/).filter(Boolean);
    if (wordsA.length === 0) return 0;
    const setB = new Set(wordsB);
    const matches = wordsA.filter((w) => setB.has(w.replace(/[.,!?]/g, ""))).length;
    return matches / wordsA.length;
  }

  function saveVocab(word: string, meaning: string) {
    if (!selectedVideo) return;
    const exists = savedVocab.find((v) => v.word === word && v.videoTitle === selectedVideo.title);
    if (exists) return;
    const updated = [...savedVocab, { word, meaning, videoTitle: selectedVideo.title }];
    setSavedVocab(updated);
    localStorage.setItem("speakloop:shadowVocab", JSON.stringify(updated));
  }

  function nextSegment() {
    if (!selectedVideo) return;
    setRecordedText("");
    setAiScore(null);
    setCurrentSegment((prev) => Math.min(prev + 1, selectedVideo.transcript.length - 1));
  }

  function prevSegment() {
    setRecordedText("");
    setAiScore(null);
    setCurrentSegment((prev) => Math.max(prev - 1, 0));
  }

  if (mode === "browse") {
    return (
      <main className="app appShell">
        <aside className="sidebar">
          <div className="sidebarLogo">
            <Sparkles size={20} />
            <span>SpeakLoop</span>
          </div>
          <nav className="sidebarNav">
            <a href="/"><Sparkles size={18} /> 首页</a>
            <button type="button" onClick={() => { window.location.href = "/app"; }}><GraduationCap size={18} /> 雅思口语</button>
            <button type="button" onClick={() => { window.location.href = "/app"; }}><BriefcaseBusiness size={18} /> 职场英语</button>
            <a href="/app/shadow" className="active"><Mic size={18} /> AI 跟读</a>
            <a href="/app"><History size={18} /> 练习记录</a>
            <a href="/app"><Settings size={18} /> AI 设置</a>
            <a href="/help">帮助中心</a>
          </nav>
        </aside>
        <div className="appMain">
      <div className="shadowBrowse">
        <div className="shadowHeader">
          <a href="/app" className="backLink"><ArrowLeft size={18} /> 返回</a>
          <h2 className="sectionTitle" style={{ textAlign: "left", marginBottom: 0 }}>AI 跟读练习</h2>
          <div className="usagePill">
            今日剩余 {usageRemaining}/5 次 AI 评分
          </div>
        </div>

        <p className="shadowIntro">看视频，听旁白，逐句跟读，AI 对比评分。在真实场景中学单词。</p>

        <div className="customSearchBox">
          <div className="searchRow">
            <input
              className="searchInput"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") searchYouTube(); }}
              placeholder="搜 YouTube 视频，如：restaurant English conversation, job interview practice..."
            />
            <button className="searchBtn" type="button" onClick={searchYouTube} disabled={isSearching}>
              {isSearching ? <Loader2 size={18} className="spin" /> : <Search size={18} />}
            </button>
          </div>
          <button className="searchToggle" type="button" onClick={() => { setShowSearch(!showSearch); if (!showSearch) searchYouTube(); }}>
            <Wand2 size={14} /> {showSearch ? "收起搜索结果" : "搜你想要的视频"}
          </button>
        </div>

        {showSearch && searchError && (
          <div className="searchError">{searchError}</div>
        )}

        {showSearch && searchResults.length > 0 && (
          <div className="searchResultsSection">
            <h3 className="searchResultsTitle">搜索结果（点击「生成跟读模板」）</h3>
            <div className="searchResultsList">
              {searchResults.map((result) => (
                <div key={result.videoId} className="searchResultCard">
                  <div className="searchResultThumb">
                    <img src={result.thumbnail} alt={result.title} loading="lazy" />
                    {result.duration && <span className="videoDuration">{result.duration}</span>}
                  </div>
                  <div className="searchResultInfo">
                    <strong>{result.title}</strong>
                    <span className="searchResultChannel">{result.channel}</span>
                  </div>
                  <button
                    className="prepareBtn"
                    type="button"
                    onClick={() => prepareVideo(result)}
                    disabled={preparingVideoId === result.videoId}
                  >
                    {preparingVideoId === result.videoId ? (
                      <><Loader2 size={14} className="spin" /> 生成中...</>
                    ) : (
                      <><Wand2 size={14} /> 生成跟读模板</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {customVideos.length > 0 && (
          <div className="customVideosSection">
            <h3 className="customVideosTitle"><Sparkles size={16} /> 我的跟读视频</h3>
            <div className="videoGrid">
              {customVideos.map((video) => (
                <div key={video.id} className="videoCard" onClick={() => startPractice(video)} role="button" tabIndex={0}>
                  <div className="videoThumb">
                    <img src={`https://img.youtube.com/vi/${getYouTubeId(video.url)}/mqdefault.jpg`} alt={video.title} loading="lazy" />
                    <span className="videoDuration">{video.duration}</span>
                  </div>
                  <div className="videoInfo">
                    <div className="videoMeta">
                      <span className="videoLevel">{video.level}</span>
                      <span className="videoCat">自定义</span>
                    </div>
                    <strong>{video.title}</strong>
                    <p className="videoDesc">{video.transcript.length} 句 · AI 已标注生词</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h3 className="libraryTitle">精选视频库</h3>
        <div className="segmented" style={{ overflowX: "auto" }}>
          {shadowCategories.map((c) => (
            <button
              key={c.key}
              className={category === c.key ? "active" : ""}
              type="button"
              onClick={() => setCategory(c.key)}
              style={{ flex: "0 0 auto", whiteSpace: "nowrap", padding: "0 14px" }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="videoGrid">
          {filteredVideos.map((video) => (
            <div key={video.id} className="videoCard" onClick={() => startPractice(video)} role="button" tabIndex={0}>
              <div className="videoThumb">
                <img
                  src={`https://img.youtube.com/vi/${getYouTubeId(video.url)}/mqdefault.jpg`}
                  alt={video.title}
                  loading="lazy"
                />
                <span className="videoDuration">{video.duration}</span>
              </div>
              <div className="videoInfo">
                <div className="videoMeta">
                  <span className="videoLevel">{video.level}</span>
                  <span className="videoCat">{video.categoryLabel}</span>
                </div>
                <strong>{video.title}</strong>
                <span className="videoTitleZh">{video.titleZh}</span>
                <p className="videoDesc">{video.description}</p>
              </div>
            </div>
          ))}
        </div>

        {savedVocab.length > 0 && (
          <div className="vocabPanel">
            <h3><BookOpen size={18} /> 我的生词本 ({savedVocab.length})</h3>
            <div className="vocabList">
              {savedVocab.map((v, i) => (
                <div key={i} className="vocabItem">
                  <strong>{v.word}</strong>
                  <span>{v.meaning}</span>
                  <small>来自：{v.videoTitle}</small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
        </div>
      </main>
    );
  }

  const video = selectedVideo!;
  const seg = video.transcript[currentSegment];

  return (
    <main className="app appShell">
      <aside className="sidebar">
        <div className="sidebarLogo">
          <Sparkles size={20} />
          <span>SpeakLoop</span>
        </div>
        <nav className="sidebarNav">
          <a href="/"><Sparkles size={18} /> 首页</a>
          <button type="button" onClick={() => { window.location.href = "/app"; }}><GraduationCap size={18} /> 雅思口语</button>
          <button type="button" onClick={() => { window.location.href = "/app"; }}><BriefcaseBusiness size={18} /> 职场英语</button>
          <a href="/app/shadow" className="active"><Mic size={18} /> AI 跟读</a>
          <a href="/app"><History size={18} /> 练习记录</a>
          <a href="/app"><Settings size={18} /> AI 设置</a>
          <a href="/help">帮助中心</a>
        </nav>
      </aside>
      <div className="appMain">
      <div className="shadowPractice">
      <div className="shadowHeader">
        <button className="backLink" onClick={() => setMode("browse")} type="button">
          <ArrowLeft size={18} /> 返回视频库
        </button>
        <h2 className="shadowPracticeTitle">{video.title}</h2>
      </div>

      <div ref={playerRef} className="videoPlayer" />

      <div className="practiceModeSwitch">
        <button
          className={practiceMode === "sentence" ? "active" : ""}
          type="button"
          onClick={() => setPracticeMode("sentence")}
        >
          逐句跟读
        </button>
        <button
          className={practiceMode === "full" ? "active" : ""}
          type="button"
          onClick={() => setPracticeMode("full")}
        >
          全片跟读
        </button>
      </div>

      {practiceMode === "sentence" ? (
        <div className="sentenceMode">
          <div className="segmentNav">
            <button onClick={prevSegment} disabled={currentSegment === 0} type="button">上一句</button>
            <span>{currentSegment + 1} / {video.transcript.length}</span>
            <button onClick={nextSegment} disabled={currentSegment === video.transcript.length - 1} type="button">下一句</button>
          </div>

          <div className="sentenceCard">
            <p className="originalText">{seg.text}</p>

            {seg.vocab && seg.vocab.length > 0 && (
              <div className="sentenceVocab">
                {seg.vocab.map((v, i) => (
                  <button
                    key={i}
                    className="vocabTag"
                    type="button"
                    onClick={() => saveVocab(v.word, v.meaning)}
                  >
                    <strong>{v.word}</strong>
                    <span>{v.phonetic}</span>
                    <small>{v.meaning}</small>
                    {savedVocab.find((sv) => sv.word === v.word) && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}

            <div className="sentenceActions">
              <button className="playBtn" type="button" onClick={() => playSegment(seg)}>
                <Play size={18} /> 播放这句
              </button>
              {isRecording ? (
                <button className="stopRecordBtn" type="button" onClick={stopRecording}>
                  <Pause size={18} /> 停止录音
                </button>
              ) : (
                <button className="recordBtn" type="button" onClick={startRecording} disabled={isScoring}>
                  <Mic size={18} /> 跟读录音
                </button>
              )}
            </div>

            {isRecording && (
              <div className="voiceWave">
                <span /><span /><span /><span /><span />
              </div>
            )}

            {recordedText && (
              <div className="recordedResult">
                <div className="recordedLabel">你说的是：</div>
                <p className="recordedText">{recordedText}</p>
                <button
                  className="scoreBtn"
                  type="button"
                  onClick={() => scoreRecording(seg.text)}
                  disabled={isScoring || usageRemaining <= 0}
                >
                  {isScoring ? <Loader2 size={16} className="spin" /> : <Volume2 size={16} />}
                  {usageRemaining > 0 ? "AI 对比评分" : "今日 AI 已用完"}
                </button>
              </div>
            )}

            {aiScore && (
              <div className="scoreResult">
                <div className="scoreCircle" style={{ borderColor: aiScore.score > 80 ? "var(--sage)" : aiScore.score > 60 ? "var(--gold)" : "var(--coral)" }}>
                  <span style={{ color: aiScore.score > 80 ? "var(--sage)" : aiScore.score > 60 ? "var(--gold)" : "var(--coral)" }}>
                    {aiScore.score > 0 ? `${aiScore.score}%` : "AI"}
                  </span>
                </div>
                <p>{aiScore.feedback}</p>
              </div>
            )}

            <button className="nextBtn" type="button" onClick={nextSegment} disabled={currentSegment === video.transcript.length - 1}>
              下一句 <ChevronRight size={16} />
            </button>
          </div>

          <div className="transcriptList">
            {video.transcript.map((s, i) => (
              <div
                key={s.id}
                className={`transcriptItem ${i === currentSegment ? "active" : ""}`}
                onClick={() => setCurrentSegment(i)}
                role="button"
                tabIndex={0}
              >
                <span className="transcriptNum">{i + 1}</span>
                <span className="transcriptText">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="fullMode">
          <p className="fullModeHint">点击播放，跟着视频一起说。播放结束后点录音，AI 会对比你的跟读。</p>
          <button className="playBtn playBtnFull" type="button" onClick={() => playSegment(video.transcript[0])}>
            <Play size={18} /> 播放全部
          </button>
          {isRecording ? (
            <button className="stopRecordBtn" type="button" onClick={stopRecording}>
              <Pause size={18} /> 停止录音
            </button>
          ) : (
            <button className="recordBtn" type="button" onClick={startRecording} disabled={isScoring}>
              <Mic size={18} /> 开始录音
            </button>
          )}
          {isRecording && (
            <div className="voiceWave">
              <span /><span /><span /><span /><span />
            </div>
          )}
          {recordedText && (
            <div className="recordedResult">
              <div className="recordedLabel">你跟读的内容：</div>
              <p className="recordedText">{recordedText}</p>
              <button
                className="scoreBtn"
                type="button"
                onClick={() => scoreRecording(video.transcript.map((s) => s.text).join(" "))}
                disabled={isScoring || usageRemaining <= 0}
              >
                {isScoring ? <Loader2 size={16} className="spin" /> : <Volume2 size={16} />}
                {usageRemaining > 0 ? "AI 对比评分" : "今日 AI 已用完"}
              </button>
            </div>
          )}
          {aiScore && (
            <div className="scoreResult">
              <p>{aiScore.feedback}</p>
            </div>
          )}
          <div className="transcriptList">
            {video.transcript.map((s) => (
              <div key={s.id} className="transcriptItem">
                <span className="transcriptNum">·</span>
                <span className="transcriptText">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
      </div>
    </main>
  );
}
