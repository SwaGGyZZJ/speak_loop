"use client";

import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  GraduationCap,
  Mic,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="landing">
      <nav className="landingNav">
        <div className="navLogo">
          <Sparkles size={22} />
          <span>SpeakLoop</span>
        </div>
        <div className="navLinks">
          <Link href="/help">帮助</Link>
          <Link href="/app" className="navCta">
            开始练习 <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="heroContent">
          <span className="heroBadge">
            <Zap size={14} /> AI 驱动 · 免费使用
          </span>
          <h1>
            把英语<span className="heroHighlight">说出来</span>
            <br />
            而不只是背下来
          </h1>
          <p className="heroDesc">
            SpeakLoop 用 AI 考官帮你练雅思口语和职场英语。真题题库、标准回答参考、智能 Band 评分，每次练习都有针对性反馈。
          </p>
          <div className="heroActions">
            <Link href="/app" className="heroPrimaryBtn">
              <Mic size={18} /> 立即开始练习
            </Link>
            <Link href="/help" className="heroSecondaryBtn">
              了解更多
            </Link>
          </div>
          <div className="heroStats">
            <div>
              <strong>67</strong>
              <span>雅思真题话题</span>
            </div>
            <div>
              <strong>25</strong>
              <span>标准回答参考</span>
            </div>
            <div>
              <strong>4</strong>
              <span>维度智能评分</span>
            </div>
          </div>
        </div>
        <div className="heroVisual">
          <div className="mockChat">
            <div className="mockBubble mockBubbleAI">
              <GraduationCap size={16} />
              <span>Describe a book you recently read.</span>
            </div>
            <div className="mockBubble mockBubbleUser">
              <span>I'd like to talk about Atomic Habits by James Clear...</span>
            </div>
            <div className="mockScore">
              <div className="mockScoreBand">
                <span className="mockBandNum">7.0</span>
                <span className="mockBandLabel">Band</span>
              </div>
              <div className="mockScoreBars">
                <MockBar label="流利度" value={75} />
                <MockBar label="词汇" value={70} />
                <MockBar label="语法" value={80} />
                <MockBar label="发音" value={72} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>两种模式，一个平台</h2>
        <div className="featureGrid">
          <div className="featureCard">
            <div className="featureIcon featureIconSage">
              <GraduationCap size={26} />
            </div>
            <h3>IELTS 雅思口语</h3>
            <ul>
              <li><Check size={14} /> Part 1/2/3 真题题库 (67 话题)</li>
              <li><Check size={14} /> Band 5-9 分数量级标准回答</li>
              <li><Check size={14} /> 四维度 AI 评分 + 改写建议</li>
              <li><Check size={14} /> 语音输入 + AI 考官追问</li>
            </ul>
          </div>
          <div className="featureCard">
            <div className="featureIcon featureIconCoral">
              <BriefcaseBusiness size={26} />
            </div>
            <h3>职场英语口语</h3>
            <ul>
              <li><Check size={14} /> 会议 / 汇报 / 面试 / 客户沟通</li>
              <li><Check size={14} /> 可复用职场表达句库</li>
              <li><Check size={14} /> 角色扮演 + 实时反馈</li>
              <li><Check size={14} /> 任务完成度评估</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="howItWorks">
        <h2>三步开始练习</h2>
        <div className="steps">
          <div className="step">
            <span className="stepNum">1</span>
            <strong>选话题</strong>
            <p>从雅思 Part 1/2/3 或职场场景中选择练习话题</p>
          </div>
          <div className="step">
            <span className="stepNum">2</span>
            <strong>开口说</strong>
            <p>语音或文字回答，AI 考官实时追问，就像真实考试</p>
          </div>
          <div className="step">
            <span className="stepNum">3</span>
            <strong>看评分</strong>
            <p>四维度 Band 评分 + 原句改写 + 提升建议</p>
          </div>
        </div>
      </section>

      <section className="pricing">
        <h2>定价</h2>
        <p className="pricingSub">现在完全免费，未来也保持核心功能免费</p>
        <div className="pricingGrid">
          <div className="pricingCard pricingCardActive">
            <span className="pricingTag">当前</span>
            <h3>免费版</h3>
            <div className="pricingPrice">
              <span className="priceNum">¥0</span>
              <span className="priceUnit">/ 永久</span>
            </div>
            <ul>
              <li><Check size={14} /> 每日 3 次 AI 评分</li>
              <li><Check size={14} /> 无限本地评分</li>
              <li><Check size={14} /> 全部题库访问</li>
              <li><Check size={14} /> 标准回答参考</li>
              <li><Check size={14} /> 练习历史记录</li>
            </ul>
            <Link href="/app" className="pricingBtn">
              开始使用 <ArrowRight size={16} />
            </Link>
          </div>
          <div className="pricingCard pricingCardSoon">
            <span className="pricingTag pricingTagSoon">规划中</span>
            <h3>Pro 版</h3>
            <div className="pricingPrice">
              <span className="priceNum">¥?</span>
              <span className="priceUnit">/ 月</span>
            </div>
            <ul>
              <li><Check size={14} /> 无限 AI 评分</li>
              <li><Check size={14} /> 个性化进步追踪</li>
              <li><Check size={14} /> 弱项专项训练计划</li>
              <li><Check size={14} /> 真人外教点评（限时）</li>
              <li><Check size={14} /> 优先体验新功能</li>
            </ul>
            <button className="pricingBtn pricingBtnDisabled" disabled>
              即将推出
            </button>
          </div>
        </div>
      </section>

      <footer className="landingFooter">
        <div className="footerInner">
          <div className="footerLogo">
            <Sparkles size={18} />
            <span>SpeakLoop</span>
          </div>
          <div className="footerLinks">
            <Link href="/app">练习</Link>
            <Link href="/help">帮助</Link>
            <Link href="/app">关于</Link>
          </div>
          <p className="footerCopy">© 2026 SpeakLoop. AI 辅助练习，评分仅供参考。</p>
        </div>
      </footer>
    </main>
  );
}

function MockBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="mockBar">
      <span>{label}</span>
      <div className="mockBarTrack">
        <div className="mockBarFill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function BriefcaseBusiness({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}
