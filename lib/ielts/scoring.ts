import type { BandLevel, IELTSAssessment, ScoredCriterion } from "./band-descriptors";

const complexConnectives = [
  "although", "however", "nevertheless", "furthermore", "moreover", "consequently",
  "nevertheless", "nonetheless", "whereas", "while", "despite", "in spite of",
  "on the other hand", "in contrast", "as a result", "for instance", "specifically",
  "in particular", "to illustrate", "not only", "not just", "rather than",
  "instead of", "owing to", "due to the fact", "given that", "provided that",
];

const advancedVocabSignals = [
  "significant", "crucial", "essential", "inevitable", "substantial", "remarkable",
  "fascinating", "intriguing", "perspective", "approach", "concept", "phenomenon",
  "fundamental", "comprehensive", "practical", "genuinely", "particularly",
  "specifically", "arguably", "undeniably", "notably", "essentially",
  "tend to", "tend not", "in terms of", "when it comes to", "as far as",
  "broadly speaking", "to some extent", "to a certain degree",
];

const idiomaticPhrases = [
  "it goes without saying", "at the end of the day", "to be honest",
  "to tell you the truth", "believe it or not", "funnily enough",
  "as a matter of fact", "so to speak", "in a sense", "more or less",
  "kind of", "sort of", "you know what i mean", "if i'm being honest",
  "i'd be lying if", "to put it simply", "long story short",
  "it occurred to me", "it struck me", "i was under the impression",
];

const fillerWords = [
  "um", "uh", "er", "erm", "like", "you know", "i mean", "basically",
  "actually", "literally", "honestly", "stuff", "things",
];

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function countSentences(text: string): number {
  return Math.max(1, (text.match(/[.!?]+/g) || []).length);
}

function averageSentenceLength(text: string): number {
  return countWords(text) / countSentences(text);
}

function countOccurrences(text: string, phrases: string[]): number {
  const lower = text.toLowerCase();
  return phrases.reduce((sum, phrase) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = lower.match(new RegExp(`\\b${escaped}`, "g"));
    return sum + (matches ? matches.length : 0);
  }, 0);
}

function hasComplexStructures(text: string): boolean {
  const lower = text.toLowerCase();
  const patterns = [
    /\bwhich\b.*\b(?:is|was|has|had|can|will)\b/,
    /\bwho\b.*\b(?:is|was|has|had|can|will)\b/,
    /\bwhose\b/,
    /\bwhere\b.*\b(?:is|was)\b/,
    /\balthough\b/,
    /\beven though\b/,
    /\bdespite\b.*\b(?:the fact|being|having)\b/,
    /\bin spite of\b/,
    /\bif\b.*\b(?:would|could|might|will)\b/,
    /\bunless\b/,
    /\bprovided that\b/,
    /\bas long as\b/,
    /\bnot only\b.*\bbut also\b/,
    /\bhardly\b.*\bwhen\b/,
    /\bno sooner\b.*\bthan\b/,
    /\bthe more\b.*\bthe more\b/,
    /\bit is\b.*\bthat\b/,
    /\bwhat\b.*\b(?:makes|worries|surprises)\b.*\bis\b/,
  ];
  return patterns.some((p) => p.test(lower));
}

function hasConditionals(text: string): boolean {
  const lower = text.toLowerCase();
  return /\bif\b.*\b(would|could|might)\b/.test(lower) || /\bwould\b.*\bif\b/.test(lower);
}

function hasPassiveVoice(text: string): boolean {
  const lower = text.toLowerCase();
  return /\b(?:is|was|are|were|been|being|be)\s+\w+ed\b/.test(lower) || /\b(?:is|was|are|were)\s+(?:known|done|made|given|taken|seen|told|shown|found|built|used|considered|regarded)\b/.test(lower);
}

function hasTenseVariety(text: string): boolean {
  const lower = text.toLowerCase();
  const tenses = [
    /\b(i|he|she|it|we|they)\s+(was|were)\b/, // past
    /\b(i|he|she|it|we|they)\s+(have|has)\s+\w+ed\b/, // present perfect
    /\b(i|he|she|it|we|they)\s+(will|would|going to)\b/, // future
    /\b(i|he|she|it|we|they)\s+(am|is|are)\s+\w+ing\b/, // present continuous
    /\bused to\b/, // used to
  ];
  return tenses.filter((p) => p.test(lower)).length >= 2;
}

function assessFluency(text: string, wordCount: number): { band: BandLevel; feedback: string } {
  const fillers = countOccurrences(text, fillerWords);
  const fillerRatio = fillers / Math.max(1, wordCount);
  const avgLen = averageSentenceLength(text);

  if (wordCount < 60) {
    return { band: 5, feedback: "回答过短，未能充分展开话题。建议使用 PREP 结构 (观点-原因-例子-总结) 将回答延长到至少 120 词。" };
  }
  if (wordCount < 100 || fillerRatio > 0.06 || avgLen < 8) {
    return {
      band: 5,
      feedback: "回答展开不足或过于依赖简单句堆砌。频繁使用填充词降低了流畅度。建议练习用连接词组织更长、更有逻辑的句子。",
    };
  }
  if (wordCount < 140 || fillerRatio > 0.04 || avgLen < 10) {
    return {
      band: 6,
      feedback: "能说一定长度但偶有犹豫。填充词使用偏多，影响语流顺畅度。建议减少 like/you know 等，用 however/in addition 等替代。",
    };
  }
  if (wordCount < 180 || fillerRatio > 0.025) {
    return {
      band: 7,
      feedback: "能说较长内容且基本流畅。偶有语言相关犹豫但不影响整体连贯性。连接词使用较好，建议进一步增加话语标记语的灵活性。",
    };
  }
  if (wordCount < 220 || fillerRatio > 0.015) {
    return {
      band: 8,
      feedback: "流利且连贯，犹豫主要与内容相关。话语展开恰当，连接词使用自然。建议关注极偶尔的重复和自我纠正。",
    };
  }
  return {
    band: 9,
    feedback: "流利自然，仅极罕见重复或自我纠正。话题展开充分恰当，话语标记语使用灵活精确。",
  };
}

function assessVocabulary(text: string, wordCount: number): { band: BandLevel; feedback: string } {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const uniqueWords = new Set(words);
  const lexicalDiversity = uniqueWords.size / Math.max(1, words.length);

  const advancedCount = countOccurrences(text, advancedVocabSignals);
  const idiomaticCount = countOccurrences(text, idiomaticPhrases);
  const totalAdvanced = advancedCount + idiomaticCount;

  if (lexicalDiversity < 0.45 || totalAdvanced === 0) {
    return {
      band: 5,
      feedback: "词汇有限且重复率高。缺少话题相关的高阶词汇。建议为每个常见话题准备 5-8 个专属词汇并刻意使用。",
    };
  }
  if (lexicalDiversity < 0.55 || totalAdvanced <= 2) {
    return {
      band: 6,
      feedback: "词汇量尚可但缺少精准和地道表达。能转述但有一定困难。建议学习搭配 (collocation) 而非单独词汇。",
    };
  }
  if (lexicalDiversity < 0.62 || totalAdvanced <= 4) {
    return {
      band: 7,
      feedback: "能灵活使用词汇讨论话题。有少量不常见和地道表达。建议增加对风格和搭配的意识。",
    };
  }
  if (lexicalDiversity < 0.68 || totalAdvanced <= 6) {
    return {
      band: 8,
      feedback: "词汇丰富且灵活，能传达精确含义。能熟练使用不常见和地道词汇。建议关注极偶尔的用词不当。",
    };
  }
  return {
    band: 9,
    feedback: "完全灵活和精确地使用词汇。自然准确地使用地道语言和搭配。",
  };
}

function assessGrammar(text: string, wordCount: number): { band: BandLevel; feedback: string } {
  const hasComplex = hasComplexStructures(text);
  const hasCond = hasConditionals(text);
  const hasPassive = hasPassiveVoice(text);
  const hasTenseVar = hasTenseVariety(text);
  const complexCount = [hasComplex, hasCond, hasPassive, hasTenseVar].filter(Boolean).length;

  const lower = text.toLowerCase();
  const errorPatterns = [
    /\b(i|he|she)\s+(is|are)\s+go\b/,
    /\bhe\s+(don't|do)\b/,
    /\bshe\s+(don't|do)\b/,
    /\bi\s+(has)\b/,
    /\bmore\s+better\b/,
    /\bvery\s+unique\b/,
  ];
  const errorCount = errorPatterns.filter((p) => p.test(lower)).length;

  if (complexCount === 0 || errorCount >= 2) {
    return {
      band: 5,
      feedback: "基本以简单句为主，缺少复杂结构。存在明显语法错误。建议练习使用 because/although/which 等构建复合句。",
    };
  }
  if (complexCount <= 1 || errorCount >= 1) {
    return {
      band: 6,
      feedback: "混合使用简单和复杂结构但灵活性有限。复杂结构偶有错误。建议增加条件句、被动语态和定语从句的使用。",
    };
  }
  if (complexCount <= 2) {
    return {
      band: 7,
      feedback: "能灵活使用一系列复杂结构。大量无误句子。建议关注嵌套从句和虚拟语气的准确性。",
    };
  }
  if (complexCount <= 3) {
    return {
      band: 8,
      feedback: "灵活使用广泛结构。大部分句子无误。语法控制力很强，仅极偶尔非系统性错误。",
    };
  }
  return {
    band: 9,
    feedback: "自然恰当地使用全方位结构。始终准确，仅偶发母语者特征的口误。",
  };
}

function assessPronunciation(wordCount: number, _text: string): { band: BandLevel; feedback: string } {
  return {
    band: wordCount >= 180 ? 7 : wordCount >= 140 ? 6 : wordCount >= 100 ? 5 : 5,
    feedback:
      wordCount >= 180
        ? "基于文本分析，你的语言产出量支持较好的发音表现。建议录音回听，检查重音、语调和连读。实际发音评分需以口语录音为准。"
        : wordCount >= 140
          ? "基于文本分析，发音特征使用可能不够始终一致。建议练习句子重音和语调起伏，特别是疑问句和强调句。实际发音评分需以口语录音为准。"
          : "回答偏短可能影响发音展示。建议充分展开回答，练习意群划分和连读。实际发音评分需以口语录音为准。",
  };
}

function clampBand(n: number): BandLevel {
  const bands: BandLevel[] = [5, 6, 7, 8, 9];
  return bands.reduce((closest, band) =>
    Math.abs(band - n) < Math.abs(closest - n) ? band : closest
  , 5 as BandLevel);
}

export function assessIELTS(transcript: { role: "ai" | "user"; text: string }[]): IELTSAssessment {
  const userText = transcript
    .filter((line) => line.role === "user")
    .map((line) => line.text)
    .join(" ");

  const wordCount = countWords(userText);

  const fluencyResult = assessFluency(userText, wordCount);
  const vocabResult = assessVocabulary(userText, wordCount);
  const grammarResult = assessGrammar(userText, wordCount);
  const pronResult = assessPronunciation(wordCount, userText);

  const criteria: ScoredCriterion[] = [
    { key: "fluency", label: "流利度与连贯性", labelEn: "Fluency & Coherence", band: fluencyResult.band, feedback: fluencyResult.feedback },
    { key: "vocabulary", label: "词汇资源", labelEn: "Lexical Resource", band: vocabResult.band, feedback: vocabResult.feedback },
    { key: "grammar", label: "语法范围与准确性", labelEn: "Grammatical Range & Accuracy", band: grammarResult.band, feedback: grammarResult.feedback },
    { key: "pronunciation", label: "发音", labelEn: "Pronunciation", band: pronResult.band, feedback: pronResult.feedback },
  ];

  const avgBand = criteria.reduce((sum, c) => sum + c.band, 0) / criteria.length;
  const overallBand = clampBand(Math.round(avgBand));

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  criteria.forEach((c) => {
    if (c.band >= 7) strengths.push(`${c.label}：${c.feedback}`);
    if (c.band <= 6) weaknesses.push(`${c.label}：${c.feedback}`);
  });

  if (strengths.length === 0) {
    const highest = criteria.reduce((max, c) => (c.band > max.band ? c : max));
    strengths.push(`${highest.label}：相对其他维度表现较好。${highest.feedback}`);
  }

  const suggestions: string[] = [];
  if (wordCount < 120) suggestions.push("增加回答长度：目标 150-200 词 (约 1.5-2 分钟)。使用 PREP 结构展开每个要点。");
  if (fluencyResult.band <= 6) suggestions.push("减少填充词 (like, you know, um)，用 however, in addition, for instance 等连接词替代。");
  if (vocabResult.band <= 6) suggestions.push("为每个话题准备 5-8 个话题专属高阶词汇，如 environment: biodiversity, sustainable, carbon footprint。");
  if (grammarResult.band <= 6) suggestions.push("刻意使用至少 3 种复杂结构：定语从句 (which/who)、条件句 (if...would)、被动语态 (is considered)。");
  if (pronResult.band <= 6) suggestions.push("录音回听并练习句子重音、语调起伏和意群划分。模仿 native speaker 的节奏。");

  const userSentences = userText.split(/[.!?]+/).filter((s) => s.trim().length > 5).slice(0, 3);

  const sentenceRewrites = userSentences.map((sentence) => {
    const trimmed = sentence.trim();
    let improved = trimmed;

    improved = improved.replace(/\bi think\b/gi, "from my perspective");
    improved = improved.replace(/\bvery good\b/gi, "exceptional");
    improved = improved.replace(/\bvery bad\b/gi, "particularly challenging");
    improved = improved.replace(/\ba lot of\b/gi, "a significant amount of");
    improved = improved.replace(/\bbig\b/gi, "substantial");
    improved = improved.replace(/\bimportant\b/gi, "crucial");
    improved = improved.replace(/\binteresting\b/gi, "fascinating");
    improved = improved.replace(/\blike\b(?=\s+(?:it|that|this|the|to))/gi, "such as");
    improved = improved.replace(/\bso\b(?=\s+(?:it|that|this|the|I))/gi, "therefore");

    if (improved === trimmed) {
      const cap = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      improved = `It is worth noting that ${cap.toLowerCase()}.`;
    }

    return {
      original: trimmed,
      improved,
      reason: "使用了更精确的词汇和更正式的句式，适合 IELTS Part 2/3 的学术语境。",
    };
  });

  const summary =
    overallBand >= 8
      ? `整体表现接近 Band ${overallBand}：语言运用自如，能灵活处理复杂话题。仅需关注极偶尔的不准确。`
      : overallBand >= 7
        ? `整体表现达到 Band ${overallBand}：能有效使用语言讨论各种话题，偶有不准确但不影响交流。`
        : overallBand >= 6
          ? `整体表现约为 Band ${overallBand}：能进行有效交流尽管有不准确之处。熟悉场景下能使用较复杂语言。`
          : `整体表现约为 Band ${overallBand}：能维持基本交流但费力。建议优先改善回答展开和复杂结构使用。`;

  return {
    overallBand,
    criteria,
    summary,
    strengths,
    weaknesses,
    suggestions,
    sentenceRewrites,
  };
}

export function getBandColor(band: BandLevel): string {
  switch (band) {
    case 9: return "#5b9a8e";
    case 8: return "#6ba88f";
    case 7: return "#d4a574";
    case 6: return "#e8956f";
    case 5: return "#d65f43";
    default: return "#8a8580";
  }
}
