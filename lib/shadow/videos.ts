export type VideoSource = "youtube" | "local";

export type TranscriptSegment = {
  id: number;
  start: number;
  duration: number;
  text: string;
  vocab?: { word: string; meaning: string; phonetic: string }[];
};

export type ShadowVideo = {
  id: string;
  title: string;
  titleZh: string;
  category: "daily" | "workplace" | "travel" | "news" | "interview";
  categoryLabel: string;
  level: "A2" | "B1" | "B2" | "C1";
  source: VideoSource;
  url: string;
  duration: string;
  description: string;
  transcript: TranscriptSegment[];
};

export const shadowVideos: ShadowVideo[] = [
  {
    id: "sv-daily-coffee",
    title: "Ordering Coffee at a Cafe",
    titleZh: "在咖啡店点单",
    category: "daily",
    categoryLabel: "日常对话",
    level: "A2",
    source: "youtube",
    url: "https://www.youtube.com/watch?v=j0H3fQGlJzM",
    duration: "2:30",
    description: "A simple cafe ordering conversation with common phrases for daily life.",
    transcript: [
      {
        id: 0,
        start: 0,
        duration: 4,
        text: "Hi, what can I get for you today?",
        vocab: [
          { word: "get for you", meaning: "为你准备（点单用语）", phonetic: "/ɡet fɔː juː/" },
        ],
      },
      {
        id: 1,
        start: 4,
        duration: 4,
        text: "I'd like a large latte, please.",
        vocab: [
          { word: "latte", meaning: "拿铁咖啡", phonetic: "/ˈlɑːteɪ/" },
          { word: "I'd like", meaning: "我想要（礼貌点单）", phonetic: "/aɪd laɪk/" },
        ],
      },
      {
        id: 2,
        start: 8,
        duration: 4,
        text: "Would you like that hot or iced?",
        vocab: [
          { word: "iced", meaning: "冰的（饮品）", phonetic: "/aɪst/" },
        ],
      },
      {
        id: 3,
        start: 12,
        duration: 5,
        text: "Hot, please. And could I get a blueberry muffin as well?",
        vocab: [
          { word: "muffin", meaning: "马芬蛋糕", phonetic: "/ˈmʌfɪn/" },
          { word: "as well", meaning: "也，还（补充）", phonetic: "/æz wel/" },
        ],
      },
      {
        id: 4,
        start: 17,
        duration: 4,
        text: "Sure. That'll be seven fifty.",
        vocab: [
          { word: "That'll be", meaning: "总共是（结账用语）", phonetic: "/ˈðætəl biː/" },
        ],
      },
      {
        id: 5,
        start: 21,
        duration: 5,
        text: "Here you go. Your latte will be ready in just a moment.",
        vocab: [
          { word: "Here you go", meaning: "给你（递东西时）", phonetic: "/hɪə juː ɡəʊ/" },
          { word: "in just a moment", meaning: "马上，一会儿", phonetic: "/ɪn dʒʌst ə ˈməʊmənt/" },
        ],
      },
      {
        id: 6,
        start: 26,
        duration: 4,
        text: "Thank you. Have a great day!",
        vocab: [],
      },
    ],
  },
  {
    id: "sv-work-standup",
    title: "Daily Standup Meeting",
    titleZh: "每日站会",
    category: "workplace",
    categoryLabel: "职场英语",
    level: "B1",
    source: "youtube",
    url: "https://www.youtube.com/watch?v=ZVMVfR8w7HA",
    duration: "3:00",
    description: "A typical agile standup with progress updates and blocker discussion.",
    transcript: [
      {
        id: 0,
        start: 0,
        duration: 5,
        text: "Good morning everyone. Let's get started with our daily standup.",
        vocab: [
          { word: "standup", meaning: "站会（敏捷开发每日例会）", phonetic: "/ˈstændʌp/" },
          { word: "get started", meaning: "开始", phonetic: "/ɡet ˈstɑːtɪd/" },
        ],
      },
      {
        id: 1,
        start: 5,
        duration: 6,
        text: "Yesterday I finished the login page and started working on the dashboard.",
        vocab: [
          { word: "dashboard", meaning: "仪表盘界面", phonetic: "/ˈdæʃbɔːd/" },
        ],
      },
      {
        id: 2,
        start: 11,
        duration: 5,
        text: "Today I'll focus on the API integration for the analytics module.",
        vocab: [
          { word: "API integration", meaning: "API 集成", phonetic: "/ˌeɪ piː aɪ ˌɪntɪˈɡreɪʃən/" },
          { word: "analytics", meaning: "数据分析", phonetic: "/ˌænəˈlɪtɪks/" },
        ],
      },
      {
        id: 3,
        start: 16,
        duration: 5,
        text: "I'm blocked on the database migration script. I need help from the DevOps team.",
        vocab: [
          { word: "blocked on", meaning: "被……卡住了", phonetic: "/blɒkt ɒn/" },
          { word: "migration", meaning: "迁移（数据库）", phonetic: "/maɪˈɡreɪʃən/" },
          { word: "DevOps", meaning: "运维开发", phonetic: "/devˈɒps/" },
        ],
      },
      {
        id: 4,
        start: 21,
        duration: 5,
        text: "I can help with that after I finish my current task. Let's sync after the meeting.",
        vocab: [
          { word: "sync", meaning: "同步/对齐（沟通）", phonetic: "/sɪŋk/" },
        ],
      },
      {
        id: 5,
        start: 26,
        duration: 5,
        text: "Great. Any other blockers? No? Alright, let's keep up the good work.",
        vocab: [
          { word: "blockers", meaning: "阻塞问题", phonetic: "/ˈblɒkəz/" },
          { word: "keep up the good work", meaning: "继续保持（鼓励语）", phonetic: "/kiːp ʌp ðə ɡʊd wɜːk/" },
        ],
      },
    ],
  },
  {
    id: "sv-travel-airport",
    title: "At the Airport Check-in",
    titleZh: "机场值机",
    category: "travel",
    categoryLabel: "旅行英语",
    level: "A2",
    source: "youtube",
    url: "https://www.youtube.com/watch?v=6v5l9KUKxQU",
    duration: "2:45",
    description: "Check-in conversation at the airport with useful travel vocabulary.",
    transcript: [
      {
        id: 0,
        start: 0,
        duration: 4,
        text: "Good morning. Where are you flying to today?",
        vocab: [
          { word: "flying to", meaning: "飞往", phonetic: "/ˈflaɪɪŋ tuː/" },
        ],
      },
      {
        id: 1,
        start: 4,
        duration: 5,
        text: "I'm flying to Singapore. Here's my passport and booking reference.",
        vocab: [
          { word: "booking reference", meaning: "预订编号", phonetic: "/ˈbʊkɪŋ ˈrefrəns/" },
        ],
      },
      {
        id: 2,
        start: 9,
        duration: 5,
        text: "Thank you. Would you prefer a window seat or an aisle seat?",
        vocab: [
          { word: "window seat", meaning: "靠窗座位", phonetic: "/ˈwɪndəʊ siːt/" },
          { word: "aisle seat", meaning: "靠过道座位", phonetic: "/aɪl siːt/" },
        ],
      },
      {
        id: 3,
        start: 14,
        duration: 4,
        text: "An aisle seat, please. I like to stretch my legs.",
        vocab: [
          { word: "stretch my legs", meaning: "伸展腿部", phonetic: "/stretʃ maɪ leɡz/" },
        ],
      },
      {
        id: 4,
        start: 18,
        duration: 5,
        text: "How many bags are you checking in?",
        vocab: [
          { word: "checking in", meaning: "托运（行李）", phonetic: "/ˈtʃekɪŋ ɪn/" },
        ],
      },
      {
        id: 5,
        start: 23,
        duration: 5,
        text: "Just one suitcase. It's under twenty-three kilograms.",
        vocab: [
          { word: "suitcase", meaning: "行李箱", phonetic: "/ˈsuːtkeɪs/" },
        ],
      },
      {
        id: 6,
        start: 28,
        duration: 5,
        text: "Perfect. Here's your boarding pass. Your gate is B12. Have a safe flight!",
        vocab: [
          { word: "boarding pass", meaning: "登机牌", phonetic: "/ˈbɔːdɪŋ pɑːs/" },
          { word: "gate", meaning: "登机口", phonetic: "/ɡeɪt/" },
          { word: "safe flight", meaning: "一路平安（飞行）", phonetic: "/seɪf flaɪt/" },
        ],
      },
    ],
  },
  {
    id: "sv-interview-tellme",
    title: "Tell Me About Yourself",
    titleZh: "面试自我介绍",
    category: "interview",
    categoryLabel: "面试英语",
    level: "B2",
    source: "youtube",
    url: "https://www.youtube.com/watch?v=kayOhGRcNt4",
    duration: "3:15",
    description: "Classic interview opening question with a strong example answer.",
    transcript: [
      {
        id: 0,
        start: 0,
        duration: 5,
        text: "So, tell me a little bit about yourself.",
        vocab: [
          { word: "a little bit", meaning: "简短地（口语）", phonetic: "/ə ˈlɪtəl bɪt/" },
        ],
      },
      {
        id: 1,
        start: 5,
        duration: 8,
        text: "Sure. I've been working in product management for about five years, mostly in the fintech space.",
        vocab: [
          { word: "product management", meaning: "产品管理", phonetic: "/ˈprɒdʌkt ˈmænɪdʒmənt/" },
          { word: "fintech", meaning: "金融科技", phonetic: "/ˈfɪntek/" },
          { word: "space", meaning: "领域/行业（口语）", phonetic: "/speɪs/" },
        ],
      },
      {
        id: 2,
        start: 13,
        duration: 7,
        text: "Before that, I studied computer science and actually started my career as a developer.",
        vocab: [
          { word: "started my career", meaning: "开始职业生涯", phonetic: "/ˈstɑːtɪd maɪ kəˈrɪə/" },
        ],
      },
      {
        id: 3,
        start: 20,
        duration: 8,
        text: "What really excites me about this role is the opportunity to bridge the gap between technical and business teams.",
        vocab: [
          { word: "excites me", meaning: "让我兴奋/感兴趣", phonetic: "/ɪkˈsaɪts miː/" },
          { word: "bridge the gap", meaning: "弥合差距/沟通桥梁", phonetic: "/brɪdʒ ðə ɡæp/" },
        ],
      },
      {
        id: 4,
        start: 28,
        duration: 6,
        text: "In my current role, I lead a team of four and we've launched three major features this quarter.",
        vocab: [
          { word: "lead a team", meaning: "带领团队", phonetic: "/liːd ə tiːm/" },
          { word: "launched", meaning: "上线/发布", phonetic: "/lɔːntʃt/" },
          { word: "quarter", meaning: "季度", phonetic: "/ˈkwɔːtə/" },
        ],
      },
      {
        id: 5,
        start: 34,
        duration: 7,
        text: "I'm now looking for a new challenge where I can scale that impact and grow as a leader.",
        vocab: [
          { word: "scale that impact", meaning: "扩大影响力", phonetic: "/skeɪl ðæt ˈɪmpækt/" },
          { word: "grow as a leader", meaning: "成长为领导者", phonetic: "/ɡrəʊ æz ə ˈliːdə/" },
        ],
      },
    ],
  },
  {
    id: "sv-news-tech",
    title: "Tech News: AI Breakthrough",
    titleZh: "科技新闻：AI 突破",
    category: "news",
    categoryLabel: "新闻英语",
    level: "B2",
    source: "youtube",
    url: "https://www.youtube.com/watch?v=2ePf9rue1Ao",
    duration: "2:50",
    description: "A short news segment about an AI development, great for formal vocabulary.",
    transcript: [
      {
        id: 0,
        start: 0,
        duration: 6,
        text: "Researchers have announced a major breakthrough in artificial intelligence this week.",
        vocab: [
          { word: "breakthrough", meaning: "突破", phonetic: "/ˈbreɪkθruː/" },
          { word: "artificial intelligence", meaning: "人工智能", phonetic: "/ˌɑːtɪˈfɪʃəl ɪnˈtelɪdʒəns/" },
        ],
      },
      {
        id: 1,
        start: 6,
        duration: 7,
        text: "The new model can process natural language with unprecedented accuracy, according to the team.",
        vocab: [
          { word: "process", meaning: "处理", phonetic: "/ˈprəʊses/" },
          { word: "unprecedented", meaning: "前所未有的", phonetic: "/ʌnˈpresɪdentɪd/" },
          { word: "accuracy", meaning: "准确性", phonetic: "/ˈækjərəsi/" },
        ],
      },
      {
        id: 2,
        start: 13,
        duration: 7,
        text: "This development could have far-reaching implications for industries ranging from healthcare to education.",
        vocab: [
          { word: "far-reaching", meaning: "影响深远的", phonetic: "/fɑːˈriːtʃɪŋ/" },
          { word: "implications", meaning: "影响/含义", phonetic: "/ˌɪmplɪˈkeɪʃənz/" },
          { word: "ranging from", meaning: "从……到……", phonetic: "/ˈreɪndʒɪŋ frɒm/" },
        ],
      },
      {
        id: 3,
        start: 20,
        duration: 6,
        text: "However, experts caution that more testing is needed before widespread deployment.",
        vocab: [
          { word: "caution", meaning: "警告/提醒", phonetic: "/ˈkɔːʃən/" },
          { word: "widespread", meaning: "广泛的", phonetic: "/ˈwaɪdspred/" },
          { word: "deployment", meaning: "部署", phonetic: "/dɪˈplɔɪmənt/" },
        ],
      },
      {
        id: 4,
        start: 26,
        duration: 6,
        text: "The company plans to release the model open-source later this year.",
        vocab: [
          { word: "open-source", meaning: "开源", phonetic: "/ˌəʊpənˈsɔːs/" },
          { word: "release", meaning: "发布", phonetic: "/rɪˈliːs/" },
        ],
      },
    ],
  },
  {
    id: "sv-daily-restaurant",
    title: "Dinner at a Restaurant",
    titleZh: "餐厅晚餐",
    category: "daily",
    categoryLabel: "日常对话",
    level: "A2",
    source: "youtube",
    url: "https://www.youtube.com/watch?v=9QcDX8Jm1vw",
    duration: "2:40",
    description: "A full restaurant conversation from ordering to paying the bill.",
    transcript: [
      {
        id: 0,
        start: 0,
        duration: 4,
        text: "Good evening. Do you have a reservation?",
        vocab: [
          { word: "reservation", meaning: "预订", phonetic: "/ˌrezəˈveɪʃən/" },
        ],
      },
      {
        id: 1,
        start: 4,
        duration: 5,
        text: "Yes, it's under the name Johnson. A table for two.",
        vocab: [
          { word: "under the name", meaning: "以……的名字预订", phonetic: "/ˈʌndə ðə neɪm/" },
        ],
      },
      {
        id: 2,
        start: 9,
        duration: 5,
        text: "Right this way. Here are your menus. Can I start you off with something to drink?",
        vocab: [
          { word: "Right this way", meaning: "这边请", phonetic: "/raɪt ðɪs weɪ/" },
          { word: "start you off", meaning: "先给您（点单）", phonetic: "/stɑːt juː ɒf/" },
        ],
      },
      {
        id: 3,
        start: 14,
        duration: 5,
        text: "I'll have a glass of red wine, and she'll have sparkling water.",
        vocab: [
          { word: "sparkling water", meaning: "气泡水", phonetic: "/ˈspɑːklɪŋ ˈwɔːtə/" },
        ],
      },
      {
        id: 4,
        start: 19,
        duration: 6,
        text: "Are you ready to order, or do you need a few more minutes?",
        vocab: [
          { word: "ready to order", meaning: "准备好点单", phonetic: "/ˈredi tuː ˈɔːdə/" },
        ],
      },
      {
        id: 5,
        start: 25,
        duration: 5,
        text: "I think we're ready. I'll have the grilled salmon, please.",
        vocab: [
          { word: "grilled salmon", meaning: "烤三文鱼", phonetic: "/ɡrɪld ˈsæmən/" },
        ],
      },
      {
        id: 6,
        start: 30,
        duration: 6,
        text: "Could we get the check, please? And we'd like to split it.",
        vocab: [
          { word: "check", meaning: "账单（美式）", phonetic: "/tʃek/" },
          { word: "split it", meaning: "AA制/分开付", phonetic: "/splɪt ɪt/" },
        ],
      },
    ],
  },
];

export const shadowCategories = [
  { key: "all", label: "全部" },
  { key: "daily", label: "日常对话" },
  { key: "workplace", label: "职场英语" },
  { key: "travel", label: "旅行英语" },
  { key: "interview", label: "面试英语" },
  { key: "news", label: "新闻英语" },
] as const;
