export type BandLevel = 5 | 6 | 7 | 8 | 9;

export type BandDescriptor = {
  band: BandLevel;
  overall: string;
  fluency: string;
  vocabulary: string;
  grammar: string;
  pronunciation: string;
  weaknesses: string[];
  improvementTips: string[];
};

export const bandDescriptors: Record<BandLevel, BandDescriptor> = {
  5: {
    band: 5,
    overall:
      "能维持基本交流但费力。简单句子可以说得比较流利，但涉及复杂内容时会出现明显停顿、重复和自我纠正。考官能听懂大意，但需要付出一定努力。",
    fluency:
      "通常能维持语流，但依赖重复、自我纠正和放慢语速来保持。可能过度使用某些连接词。简单内容流利，复杂内容出现流畅度问题。",
    vocabulary:
      "能谈论话题但词汇有限。通常能成功转述但有一定困难。可能出现明显的选词错误，偶尔影响理解。",
    grammar:
      "基本句型准确度尚可。复杂结构范围有限且通常包含错误。复杂结构中的频繁错误有时影响理解。",
    pronunciation:
      "尝试控制发音特征但常常不成功。部分误读可能造成听者理解困难。可能展现部分 band 6 特征。",
    weaknesses: [
      "回答过短，展开不够",
      "频繁使用填充词 (like, you know, err)",
      "简单句堆砌，缺少复合和复杂句",
      "词汇重复率高，缺少同义替换",
      "时态错误频繁 (过去时/现在完成时混淆)",
      "单复数和冠词错误",
    ],
    improvementTips: [
      "练习用 PREP 结构展开回答 (Point-Reason-Example-Point)",
      "每个回答至少包含一个复合句 (because, although, which)",
      "为常见话题准备 5-8 个话题相关词汇",
      "录音回听，标记停顿超过 2 秒的地方并练习填补",
      "刻意使用连接词: firstly, in addition, however, as a result",
    ],
  },
  6: {
    band: 6,
    overall:
      "能有效交流尽管有不准确之处。能在熟悉场景下使用和理解较复杂的语言。愿意说较长内容，但偶尔因重复、自我纠正或犹豫而失去连贯性。",
    fluency:
      "愿意说较长内容，但偶尔因重复、自我纠正或犹豫而失去连贯性。使用一系列连接词和话语标记语，但并非总是恰当。",
    vocabulary:
      "有足够的词汇讨论话题并能清楚表达意思，尽管有用词不当之处。通常能成功转述。",
    grammar:
      "混合使用简单和复杂结构，但灵活性有限。复杂结构频繁出错，但很少造成理解问题。",
    pronunciation:
      "使用一系列发音特征但控制不始终一致。部分词语/发音的误读降低清晰度，但意思总体清楚。",
    weaknesses: [
      "复杂句结构单一 (主要靠 because/so)",
      "时态切换不自然",
      "词汇够用但缺少精准和地道表达",
      "连接词使用机械，有时不恰当",
      "语调平淡，缺少重音变化",
      "偶尔因找词导致长停顿",
    ],
    improvementTips: [
      "增加句型多样性: 定语从句、条件句、被动语态各至少用一次",
      "学习并使用 3-5 个地道搭配 (collocation) 而非单独词汇",
      "练习用 while/whereas/on the other hand 做对比",
      "录音检查: 每分钟自我纠正不超过 2 次",
      "练习句子重音和语调起伏，特别是疑问句和强调句",
    ],
  },
  7: {
    band: 7,
    overall:
      "能灵活有效地使用语言。能说较长内容且无明显费力或失去连贯性。偶有语言相关犹豫或重复自我纠正。能使用较不常见和地道的词汇，并能有效转述。",
    fluency:
      "能说较长内容，无明显费力或失去连贯性。偶有语言相关犹豫或一些重复/自我纠正。能灵活使用一系列连接词和话语标记语。",
    vocabulary:
      "能灵活使用词汇讨论各种话题。使用一些较不常见和地道的词汇，并展现对风格/搭配的意识，偶尔有不当选择。能有效转述。",
    grammar:
      "能灵活使用一系列复杂结构。产出大量无误句子，但仍有语法错误。",
    pronunciation:
      "展现 band 6 的所有特征以及部分 band 8 的正面特征。整体清晰自然。",
    weaknesses: [
      "复杂结构偶有错误，特别是嵌套从句",
      "词汇偶有不地道搭配",
      "语流中偶尔出现犹豫找词",
      "发音特征使用不始终一致",
      "Part 3 讨论深度不够，观点展开有局限",
    ],
    improvementTips: [
      "练习使用虚拟语气和倒装句增加表达力",
      "积累话题专属的高阶词汇 (如 environment: biodiversity, carbon footprint, sustainable)",
      "Part 3 练习多角度分析: economic, social, cultural, technological 角度",
      "录音对比 native speaker 样本，模仿语调和节奏",
      "减少 'I think' 开头，用 From my perspective / It seems to me 替代",
    ],
  },
  8: {
    band: 8,
    overall:
      "完全自如地运用语言，仅偶尔出现非系统性不准确。能很好地处理复杂详细论证。使用广泛词汇灵活传达精确含义。大量无误句子。",
    fluency:
      "流利说话，仅偶尔重复/自我纠正。犹豫通常与内容相关而非找词/语法。能连贯恰当地展开话题。",
    vocabulary:
      "使用广泛词汇资源，灵活传达精确含义。能熟练使用不常见和地道词汇，偶尔有不准确。",
    grammar:
      "灵活使用广泛结构。产出大部分无误句子，仅极偶尔出现不当或非系统性错误。",
    pronunciation:
      "在大部分测试中使用广泛发音特征。容易理解；母语口音不影响清晰度。",
    weaknesses: [
      "极偶尔的用词不当",
      "极少数复杂结构错误",
      "发音特征偶有不稳定",
      "Part 3 可能缺少深度层次感",
    ],
    improvementTips: [
      "关注语用恰当性: 正式 vs 非正式场景的词汇选择",
      "练习使用修辞手法: 比喻、类比、排比",
      "Part 3 练习构建完整论证链: claim → evidence → counter-argument → conclusion",
      "模仿 TED 演讲者的语速节奏和停顿策略",
      "注意语域意识: Part 1 可稍随意，Part 3 需更学术",
    ],
  },
  9: {
    band: 9,
    overall:
      "完全自如地运用语言，恰当、准确且流利，理解完整。能使用全方位发音特征且精确和微妙。毫不费力即可理解。",
    fluency:
      "流利说话，仅极罕见重复或自我纠正。任何犹豫都与内容相关而非找词/语法。能充分恰当地展开话题。",
    vocabulary:
      "在所有话题中完全灵活和精确地使用词汇。自然准确地使用地道语言和搭配。",
    grammar:
      "自然恰当地使用全方位结构。除偶发母语者特征的口误外，始终准确。",
    pronunciation:
      "使用全方位发音特征且精确和微妙。毫不费力即可理解。",
    weaknesses: [
      "几乎没有系统性弱点",
      "偶尔的非系统性口误 (母语者也会有)",
    ],
    improvementTips: [
      "保持自然交流，不要过度追求完美",
      "关注语用微妙性: 幽默、反讽、委婉表达",
      "练习即兴演讲能力，应对任何话题",
      "广泛阅读和听力输入保持语言敏感度",
    ],
  },
};

export const scoringCriteria = [
  {
    key: "fluency",
    label: "流利度与连贯性",
    labelEn: "Fluency & Coherence",
    weight: 25,
    description: "语流顺畅度、逻辑组织、连接词使用、话题展开能力",
  },
  {
    key: "vocabulary",
    label: "词汇资源",
    labelEn: "Lexical Resource",
    weight: 25,
    description: "词汇范围、精确度、转述能力、地道搭配使用",
  },
  {
    key: "grammar",
    label: "语法范围与准确性",
    labelEn: "Grammatical Range & Accuracy",
    weight: 25,
    description: "句型多样性、复杂结构使用、错误频率与影响",
  },
  {
    key: "pronunciation",
    label: "发音",
    labelEn: "Pronunciation",
    weight: 25,
    description: "单音、重音、语调、连读、意群划分、可理解度",
  },
] as const;

export type ScoredCriterion = {
  key: "fluency" | "vocabulary" | "grammar" | "pronunciation";
  label: string;
  labelEn: string;
  band: BandLevel;
  feedback: string;
};

export type IELTSAssessment = {
  overallBand: BandLevel;
  criteria: ScoredCriterion[];
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  sentenceRewrites: { original: string; improved: string; reason: string }[];
};
