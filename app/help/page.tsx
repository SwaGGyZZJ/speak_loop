"use client";

import Link from "next/link";
import { ArrowRight, Award, BookOpen, GraduationCap, KeyRound, Mic, Target, TrendingUp } from "lucide-react";

export default function HelpPage() {
  return (
    <main className="landing">
      <nav className="landingNav">
        <div className="navLogo">
          <GraduationCap size={22} />
          <span>SpeakLoop</span>
        </div>
        <div className="navLinks">
          <Link href="/">首页</Link>
          <Link href="/app" className="navCta">
            开始练习 <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <article className="helpArticle">
        <h1>帮助中心</h1>
        <p className="helpIntro">从零开始使用 SpeakLoop，快速上手雅思口语和职场英语练习。</p>

        <section className="helpSection">
          <h2><Target size={20} /> 快速开始</h2>
          <ol className="helpList">
            <li><strong>进入练习：</strong>点击「开始练习」进入应用主页</li>
            <li><strong>选择模式：</strong>雅思口语 (Part 1/2/3) 或 职场英语 (会议/汇报/面试)</li>
            <li><strong>选择话题：</strong>从题库中挑选一个话题开始练习</li>
            <li><strong>开口回答：</strong>点击麦克风语音输入，或直接打字</li>
            <li><strong>查看评分：</strong>AI 考官给出 Band 分数、四维度评价和改写建议</li>
          </ol>
        </section>

        <section className="helpSection">
          <h2><KeyRound size={20} /> 配置 AI 考官</h2>
          <p>SpeakLoop 默认使用本地规则评分，配置 DeepSeek API Key 后可启用 AI 智能评分。</p>
          <ol className="helpList">
            <li>访问 <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="settingsLink">platform.deepseek.com</a> 注册账号</li>
            <li>在「API Keys」页面创建新 Key</li>
            <li>在 SpeakLoop 应用中点击「AI 设置」</li>
            <li>粘贴 Key，点击「测试连接」验证</li>
            <li>点击「保存」启用 AI 考官</li>
          </ol>
          <div className="helpNote">
            <strong>免费额度：</strong>每日 3 次 AI 评分，本地评分不限次数。API Key 仅保存在浏览器本地，不上传服务器。
          </div>
        </section>

        <section className="helpSection">
          <h2><GraduationCap size={20} /> IELTS 雅思口语指南</h2>
          <h3>Part 1 — 问答 (4-5 分钟)</h3>
          <p>考官问 3-4 个熟悉话题（工作、学习、家乡、爱好等），每话题约 4 道题。回答 2-4 句即可，不需要太长。</p>
          <div className="helpTip"><strong>技巧：</strong>不要只答 Yes/No，用 PREP 结构展开 (Point-Reason-Example-Point)。</div>

          <h3>Part 2 — 独白 (3-4 分钟)</h3>
          <p>给 cue card，1 分钟准备 + 1-2 分钟连续独白。需覆盖卡片上的所有要点。</p>
          <div className="helpTip"><strong>技巧：</strong>准备时在纸上写关键词，不要写完整句子。说的时候如果忘了一个点，自然跳过即可。</div>

          <h3>Part 3 — 讨论 (4-5 分钟)</h3>
          <p>基于 Part 2 话题的深度讨论，问题更抽象。需要分析、对比、举例。</p>
          <div className="helpTip"><strong>技巧：</strong>从经济、社会、文化、技术多角度展开。用 "On the one hand... on the other hand..." 做对比。</div>
        </section>

        <section className="helpSection">
          <h2><Award size={20} /> Band 评分标准</h2>
          <table className="helpTable">
            <thead>
              <tr><th>Band</th><th>水平</th><th>特点</th></tr>
            </thead>
            <tbody>
              <tr><td>9</td><td>Expert</td><td>自如、准确、流利，完全理解</td></tr>
              <tr><td>8</td><td>Very Good</td><td>偶有非系统性不准确，复杂论证能力强</td></tr>
              <tr><td>7</td><td>Good</td><td>偶有不准确，能处理复杂语言</td></tr>
              <tr><td>6</td><td>Competent</td><td>有效使用尽管有不准确，能处理较复杂语言</td></tr>
              <tr><td>5</td><td>Modest</td><td>部分掌握，大意可懂但错误多</td></tr>
            </tbody>
          </table>
          <p>四维度各占 25%：流利度与连贯性、词汇资源、语法范围与准确性、发音。</p>
        </section>

        <section className="helpSection">
          <h2><Mic size={20} /> 语音功能说明</h2>
          <ul className="helpList">
            <li><strong>语音输入：</strong>使用浏览器 Web Speech API，推荐 Chrome 或 Safari</li>
            <li><strong>AI 语音：</strong>使用浏览器 Speech Synthesis API 朗读考官问题</li>
            <li><strong>注意：</strong>部分浏览器需要 HTTPS 才能使用麦克风。如果语音不工作，可切换为文字输入</li>
          </ul>
        </section>

        <section className="helpSection">
          <h2><TrendingUp size={20} /> 提升建议</h2>
          <ul className="helpList">
            <li>每天练习 1-2 个话题，保持语感</li>
            <li>录音回听，标记停顿和重复</li>
            <li>对比标准回答，学习高分表达</li>
            <li>准备「万能故事」可适配多个 cue card</li>
            <li>积累话题专属高阶词汇，如 environment: biodiversity, sustainable</li>
          </ul>
        </section>

        <div className="helpCta">
          <Link href="/app" className="heroPrimaryBtn">
            <Mic size={18} /> 开始练习
          </Link>
        </div>
      </article>

      <footer className="landingFooter">
        <div className="footerInner">
          <div className="footerLogo">
            <GraduationCap size={18} />
            <span>SpeakLoop</span>
          </div>
          <div className="footerLinks">
            <Link href="/">首页</Link>
            <Link href="/app">练习</Link>
          </div>
          <p className="footerCopy">© 2026 SpeakLoop. AI 辅助练习，评分仅供参考。</p>
        </div>
      </footer>
    </main>
  );
}
