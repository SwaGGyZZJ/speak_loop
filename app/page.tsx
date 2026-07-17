"use client";

import {
  ArrowRight,
  Check,
  GraduationCap,
  Heart,
  Lightbulb,
  Loader2,
  Mic,
  PenTool,
  BookOpen,
  Send,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Suggestion = {
  id: string;
  nickname: string;
  content: string;
  scenario: string;
  createdAt: string;
  likes: number;
};

export default function LandingPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [scenario, setScenario] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/suggestions")
      .then((r) => r.json())
      .then((d) => {
        if (d.suggestions) setSuggestions(d.suggestions);
      })
      .catch(() => {});

    const liked = localStorage.getItem("speakloop:likedSuggestions");
    if (liked) {
      try { setLikedIds(new Set(JSON.parse(liked))); } catch {}
    }
  }, []);

  async function submitSuggestion() {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          nickname: nickname.trim() || "匿名用户",
          content: content.trim(),
          scenario: scenario.trim() || "其他",
        }),
      });
      const data = await res.json();
      if (data.ok && data.suggestion) {
        setSuggestions((prev) => [data.suggestion, ...prev]);
        setContent("");
        setScenario("");
        setShowForm(false);
      }
    } catch {}
    setIsSubmitting(false);
  }

  async function toggleLike(sug: Suggestion) {
    const alreadyLiked = likedIds.has(sug.id);
    const newLiked = new Set(likedIds);
    if (alreadyLiked) {
      newLiked.delete(sug.id);
    } else {
      newLiked.add(sug.id);
    }
    setLikedIds(newLiked);
    localStorage.setItem("speakloop:likedSuggestions", JSON.stringify([...newLiked]));

    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === sug.id ? { ...s, likes: alreadyLiked ? Math.max(0, s.likes - 1) : s.likes + 1 } : s
      )
    );

    try {
      await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like", id: sug.id, alreadyLiked }),
      });
    } catch {}
  }

  return (
    <main className="landing">
      <nav className="landingNav">
        <div className="navLogo">
          <PenTool size={22} />
          <span className="navLogoText">SpeakLoop</span>
        </div>
        <div className="navLinks">
          <Link href="/help">帮助</Link>
          <Link href="/app" className="navCta">
            开始 <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="heroContent">
          <span className="heroTag">AI 口语练习本</span>
          <h1 className="heroTitle">
            把英语
            <span className="heroUnderline">说出来</span>
            <br />
            不只是背下来
          </h1>
          <p className="heroDesc">
            翻开你的英语练习本。AI 考官出题，你开口回答，
            每次练完拿到 Band 评分和手写批注般的改写建议。
          </p>
          <div className="heroActions">
            <Link href="/app" className="btnPrimary">
              <Mic size={17} /> 开始练习
            </Link>
            <Link href="/help" className="btnGhost">
              怎么用？
            </Link>
          </div>
        </div>

        <div className="heroVisual">
          <div className="notebookCard">
            <div className="notebookTabs">
              <span className="notebookTab notebookTabActive" />
              <span className="notebookTab" />
              <span className="notebookTab" />
            </div>
            <div className="notebookBody">
              <p className="notebookPrompt">
                <GraduationCap size={15} /> Describe a book you recently read.
              </p>
              <div className="notebookAnswer">
                I'd like to talk about Atomic Habits by James Clear...
              </div>
              <div className="notebookGrade">
                <div className="gradeCircle">
                  <span className="gradeNum">7.0</span>
                  <span className="gradeLabel">Band</span>
                </div>
                <div className="gradeMarks">
                  <GradeMark label="流利度" color="var(--sage)" />
                  <GradeMark label="词汇" color="var(--gold)" />
                  <GradeMark label="语法" color="var(--coral)" />
                  <GradeMark label="发音" color="var(--blue)" />
                </div>
              </div>
              <div className="notebookFeedback">
                <span className="feedbackArrow">→</span>
                "The book tell me" → "The book advises me"
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stickySection">
        <h2 className="sectionTitle">
          三种练习<span className="titleDot">·</span>一个本子
        </h2>
        <div className="stickyGrid">
          <Link href="/app" className="stickyCard stickyCardGreen">
            <div className="stickyCardPin" />
            <div className="stickyIcon stickyIconGreen">
              <GraduationCap size={28} />
            </div>
            <h3>雅思口语</h3>
            <ul>
              <li><Check size={13} /> Part 1/2/3 真题 67 话题</li>
              <li><Check size={13} /> Band 5-9 标准回答对照</li>
              <li><Check size={13} /> 四维度 AI 评分</li>
              <li><Check size={13} /> 语音输入 + 考官追问</li>
            </ul>
          </Link>
          <Link href="/app" className="stickyCard stickyCardOrange" style={{ marginTop: 24 }}>
            <div className="stickyCardPin" />
            <div className="stickyIcon stickyIconOrange">
              <BookOpen size={28} />
            </div>
            <h3>职场英语</h3>
            <ul>
              <li><Check size={13} /> 会议/汇报/面试/客户</li>
              <li><Check size={13} /> 可复用表达句库</li>
              <li><Check size={13} /> 角色扮演实时反馈</li>
              <li><Check size={13} /> 任务完成度评估</li>
            </ul>
          </Link>
          <Link href="/app/shadow" className="stickyCard stickyCardBlue" style={{ marginTop: 12 }}>
            <div className="stickyCardPin" />
            <div className="stickyIcon stickyIconBlue">
              <Mic size={28} />
            </div>
            <h3>AI 跟读</h3>
            <ul>
              <li><Check size={13} /> 真实场景视频 + 逐句跟读</li>
              <li><Check size={13} /> AI 对比评分发音</li>
              <li><Check size={13} /> 点击收藏生词带释义</li>
              <li><Check size={13} /> 全片跟读 + 逐句模式</li>
            </ul>
          </Link>
        </div>
      </section>

      <section className="stepsSection">
        <h2 className="sectionTitle">
          三步<span className="titleDot">·</span>翻一页
        </h2>
        <div className="stepsFlow">
          <div className="stepItem">
            <div className="stepIcon">
              <span className="stepEmoji">1</span>
            </div>
            <strong>选话题</strong>
            <p>从题库翻一个想练的</p>
          </div>
          <div className="stepArrow">→</div>
          <div className="stepItem">
            <div className="stepIcon stepIcon2">
              <span className="stepEmoji">2</span>
            </div>
            <strong>开口说</strong>
            <p>AI 考官追问，像真考</p>
          </div>
          <div className="stepArrow">→</div>
          <div className="stepItem">
            <div className="stepIcon stepIcon3">
              <span className="stepEmoji">3</span>
            </div>
            <strong>看批注</strong>
            <p>Band 分 + 改写 + 建议</p>
          </div>
        </div>
      </section>

      <section className="suggestionSection">
        <h2 className="sectionTitle">
          你想练什么<span className="titleDot">·</span>告诉我
        </h2>
        <p className="suggestionSub">想练的场景、想要的练习形式、想加的功能，留言告诉我。点赞多的优先做。</p>

        {!showForm && (
          <button className="btnPrimary btnSmall suggestionTrigger" type="button" onClick={() => setShowForm(true)}>
            <Lightbulb size={16} /> 我有个想法
          </button>
        )}

        {showForm && (
          <div className="suggestionForm">
            <input
              className="suggestionInput"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="昵称（选填）"
              maxLength={30}
            />
            <input
              className="suggestionInput"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="场景标签，如：点餐/面试/旅行/自由对话..."
              maxLength={50}
            />
            <textarea
              className="suggestionTextarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="说说你想练什么，想要什么样的练习形式..."
              maxLength={500}
              rows={3}
            />
            <div className="suggestionFormActions">
              <button className="btnGhost btnSmall" type="button" onClick={() => setShowForm(false)}>
                取消
              </button>
              <button className="btnPrimary btnSmall" type="button" onClick={submitSuggestion} disabled={isSubmitting || !content.trim()}>
                {isSubmitting ? <Loader2 size={15} className="spin" /> : <Send size={15} />}
                提交
              </button>
            </div>
          </div>
        )}

        <div className="suggestionList">
          {suggestions.length === 0 && (
            <div className="suggestionEmpty">
              还没有留言，来第一个吧
            </div>
          )}
          {suggestions.map((sug) => (
            <div key={sug.id} className="suggestionCard">
              <div className="suggestionPin" />
              <div className="suggestionHeader">
                <span className="suggestionNick">{sug.nickname}</span>
                <span className="suggestionScenario">{sug.scenario}</span>
              </div>
              <p className="suggestionContent">{sug.content}</p>
              <div className="suggestionFooter">
                <span className="suggestionTime">{timeAgo(sug.createdAt)}</span>
                <button
                  className={`likeBtn ${likedIds.has(sug.id) ? "liked" : ""}`}
                  type="button"
                  onClick={() => toggleLike(sug)}
                >
                  <Heart size={14} fill={likedIds.has(sug.id) ? "currentColor" : "none"} />
                  {sug.likes}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pricingSection">
        <h2 className="sectionTitle">
          定价<span className="titleDot">·</span>不绕弯
        </h2>
        <div className="pricingSimple">
          <div className="pricingRow pricingRowActive">
            <div className="pricingRowLeft">
              <span className="pricingBadge pricingBadgeFree">现在</span>
              <strong>免费</strong>
              <span className="pricingDetail">每日 3 次 AI 评分 + 无限本地评分 + 全题库</span>
            </div>
            <Link href="/app" className="btnPrimary btnSmall">
              开始 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="pricingRow pricingRowSoon">
            <div className="pricingRowLeft">
              <span className="pricingBadge pricingBadgeSoon">规划中</span>
              <strong>Pro</strong>
              <span className="pricingDetail">无限 AI 评分 + 进步追踪 + 弱项训练计划</span>
            </div>
            <span className="pricingSoonText">即将推出</span>
          </div>
        </div>
      </section>

      <footer className="landingFooter">
        <div className="footerInner">
          <div className="navLogo">
            <PenTool size={18} />
            <span className="navLogoText">SpeakLoop</span>
          </div>
          <div className="footerLinks">
            <Link href="/app">练习</Link>
            <Link href="/help">帮助</Link>
          </div>
          <p className="footerCopy">© 2026 SpeakLoop · AI 辅助练习，评分仅供参考</p>
        </div>
      </footer>
    </main>
  );
}

function GradeMark({ label, color }: { label: string; color: string }) {
  return (
    <div className="gradeMark" style={{ borderColor: color }}>
      <span style={{ background: color }} />
      {label}
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} 天前`;
  return new Date(iso).toLocaleDateString();
}
