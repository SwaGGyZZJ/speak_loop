import type { BandLevel } from "./band-descriptors";

export type ModelAnswer = {
  cueCardId: string;
  band: BandLevel;
  answer: string;
  analysis: {
    fluency: string;
    vocabulary: string;
    grammar: string;
    pronunciation: string;
  };
  highlights: string[];
};

export const modelAnswers: ModelAnswer[] = [
  // ============================================================
  // Topic 1: p2-book — "Describe a book you have recently read"
  // ============================================================
  {
    cueCardId: "p2-book",
    band: 5,
    answer:
      "I want to talk about a book I read. The book name is 'The Alchemist'. It is a famous book. The writer is Paulo Coelho. He is from Brazil. My friend give me this book last month. I read it in two weeks. The story is about a boy. He is a shepherd. He want to travel to find treasure. He go to Egypt. He meet many people on the way. He learn many things. I like this book because it is interesting. The story is simple but it have good meaning. The meaning is you should follow your dream. I think it is good book for young people. I recommend to my friends. They also like it. The book is not long so it is easy to read. I think I will read again in the future.",
    analysis: {
      fluency:
        "Speech is maintained through short, simple sentences but relies heavily on repetitive subject-verb patterns. No connectives beyond 'because' and 'but'. Noticeable lack of expansion on any single point.",
      vocabulary:
        "Vocabulary is limited to basic, high-frequency words ('famous', 'interesting', 'treasure'). No attempt at paraphrasing or less common lexis. Repetitive use of 'good' and 'like'.",
      grammar:
        "Frequent basic errors: 'He want' (missing -s), 'He go' (missing -s), 'it have' (wrong form), 'My friend give' (past tense error). Almost entirely simple sentences with no complex structures.",
      pronunciation:
        "Likely clear enough to understand at word level, but sentence stress and intonation are probably flat and repetitive, matching the simple sentence structure.",
    },
    highlights: [
      "Frequent subject-verb agreement errors: 'He want', 'He go', 'it have'",
      "Almost exclusively simple sentences with no subordination",
      "Limited, repetitive vocabulary: 'good', 'like', 'interesting' used multiple times",
    ],
  },
  {
    cueCardId: "p2-book",
    band: 6,
    answer:
      "I'd like to talk about a book I read recently, which is called 'The Midnight Library' by Matt Haig. It's a novel about a woman named Nora who finds a library between life and death, where each book gives her a chance to live a different version of her life. I chose to read it because I saw many good reviews online, and the concept sounded interesting to me. The story basically shows how Nora tries different lives — she becomes a swimmer, a glaciologist, a rock star — and she realizes that every life has its own problems. What I enjoyed about this book was the message that we shouldn't regret our choices so much. I think it's a good book for people who sometimes wonder 'what if' about their lives. I finished it quite quickly because the story was engaging. I would recommend it to anyone who likes thought-provoking stories.",
    analysis: {
      fluency:
        "Willing to speak at length and covers all cue card points. Uses some connectives ('because', 'and') but transitions between ideas are somewhat mechanical. Occasional awkward pauses likely where searching for words.",
      vocabulary:
        "Adequate vocabulary for the topic with some attempt at less common items ('glaciologist', 'thought-provoking', 'engaging'). Generally clear meaning but lacks precision and idiomatic range.",
      grammar:
        "Mix of simple and complex sentences. Uses relative clauses ('which is called', 'where each book') competently. Some structures are accurate, but range is limited and mostly relies on 'because' for subordination.",
      pronunciation:
        "Generally clear and understandable. Likely uses some intonation appropriately but may lack consistent control of sentence stress and connected speech features.",
    },
    highlights: [
      "Relative clauses used competently: 'which is called', 'where each book gives her a chance'",
      "Some less common vocabulary: 'glaciologist', 'thought-provoking', 'engaging'",
      "Covers all cue card points but transitions are somewhat mechanical",
    ],
  },
  {
    cueCardId: "p2-book",
    band: 7,
    answer:
      "I'd like to talk about a book I read recently called 'Atomic Habits' by James Clear. It's a self-help book that explores how small changes in our daily routines can lead to remarkable results over time. I picked it up because a colleague of mine recommended it highly, and I was going through a phase where I wanted to improve my productivity. The book basically argues that instead of focusing on goals, we should focus on building systems and habits. What I found particularly interesting was the concept of 'habit stacking' — the idea that you can build a new habit by attaching it to an existing one. For instance, if you want to start meditating, you could do it right after your morning coffee. I think this book would appeal to anyone who feels stuck in their routines and is looking for practical, actionable advice rather than vague motivation. What I really liked about it was that it wasn't just theory — it was backed by research and real-world examples, which made it much more convincing. I finished it in about a week because it was genuinely hard to put down.",
    analysis: {
      fluency:
        "Speaks at length without noticeable effort. Uses a range of connectives naturally. Occasional minor hesitation but does not impede flow.",
      vocabulary:
        "Uses some less common vocabulary ('remarkable results', 'habit stacking', 'actionable advice'). Generally precise with occasional flexibility in expression.",
      grammar:
        "Produces a range of complex structures with some flexibility ('instead of focusing on goals, we should focus on...'). Frequent error-free sentences.",
      pronunciation:
        "Generally clear and easy to understand. Shows some positive features of band 8 but not consistently throughout.",
    },
    highlights: [
      "'habit stacking' — the idea that you can build a new habit by attaching it to an existing one",
      "wasn't just theory — it was backed by research and real-world examples",
      "I was going through a phase where I wanted to improve my productivity",
    ],
  },
  {
    cueCardId: "p2-book",
    band: 8,
    answer:
      "I'd like to share my thoughts on a book I finished recently — 'Educated' by Tara Westover, which is a remarkable memoir recounting the author's journey from a secluded, survivalist family in rural Idaho to earning a PhD from Cambridge University. I was drawn to it after a professor mentioned it in a lecture on the sociology of education, and I found it utterly compelling from the very first chapter. What sets this book apart is Westover's unflinching honesty in depicting both her family's extreme beliefs and her own internal struggle to reconcile her love for them with the need to forge her own path. The prose is elegant yet accessible, and she has a gift for conveying complex emotions with striking clarity. I was particularly moved by the passages describing her first encounters with formal education — moments that most of us take for granted but which she experienced as revelations. I'd wholeheartedly recommend it to anyone interested in questions of identity, resilience, and the transformative power of learning. It's one of those rare books that lingers in your mind long after the final page.",
    analysis: {
      fluency:
        "Fluent and coherent throughout. Hesitation, if any, is content-related rather than language-related. Discourse markers ('What sets this book apart', 'I was particularly moved by') are used naturally and effectively.",
      vocabulary:
        "Wide lexical resource used flexibly and precisely: 'secluded', 'unflinching honesty', 'forge her own path', 'striking clarity'. Uncommon lexical items are used accurately and idiomatically.",
      grammar:
        "Flexible use of a wide range of structures, including relative clauses, participial phrases, and nuanced modal expressions. Virtually error-free throughout.",
      pronunciation:
        "Clear and natural throughout. Sentence stress, intonation, and chunking are effectively used to convey meaning and emphasis.",
    },
    highlights: [
      "Westover's unflinching honesty in depicting both her family's extreme beliefs and her own internal struggle",
      "one of those rare books that lingers in your mind long after the final page",
      "elegant yet accessible — conveying complex emotions with striking clarity",
    ],
  },
  {
    cueCardId: "p2-book",
    band: 9,
    answer:
      "I'd like to discuss a book that left an indelible impression on me — 'The Overstory' by Richard Powers, a sweeping novel that interweaves the lives of nine strangers whose experiences with trees profoundly alter the course of their existence. I stumbled upon it quite by chance, having picked it up in an independent bookshop while waiting for a friend, and I confess I was initially drawn in by the sheer audacity of a novel structured around the natural world. What I found most arresting was Powers's ability to inhabit perspectives ranging from a military veteran to a tech genius to, most remarkably, the trees themselves — granting them a kind of narrative agency that I'd never encountered in fiction. The writing is luminous and layered, effortlessly blending scientific rigor with genuine literary artistry, and it prompted me to reconsider my own relationship with the natural world in ways I hadn't anticipated. It's the sort of book that doesn't merely entertain but genuinely reshapes how you perceive the world around you. I found myself rationing the final chapters, reluctant to reach the end, and I've since bought copies for several friends, each of whom has responded to it in a wonderfully different way.",
    analysis: {
      fluency:
        "Effortless, fully natural speech. Any hesitation is purely content-related — choosing the precise word for a nuanced idea. Fully coherent and appropriately developed throughout.",
      vocabulary:
        "Completely flexible and precise lexical resource. Idiomatic and nuanced: 'indelible impression', 'sheer audacity', 'narrative agency', 'rationing the final chapters'. Used with the naturalness of an educated native speaker.",
      grammar:
        "Full range of structures used naturally and appropriately: participial clauses ('having picked it up'), cleft constructions, relative clauses of varying complexity. Consistently accurate.",
      pronunciation:
        "Full range of pronunciation features used with precision and subtlety. Effortless to understand throughout, with natural rhythm and intonation.",
    },
    highlights: [
      "granting them a kind of narrative agency that I'd never encountered in fiction",
      "rationing the final chapters, reluctant to reach the end",
      "effortlessly blending scientific rigor with genuine literary artistry",
    ],
  },

  // ============================================================
  // Topic 2: p2-recent-visit — "Describe a place you have recently visited"
  // ============================================================
  {
    cueCardId: "p2-recent-visit",
    band: 5,
    answer:
      "Last month I went to Hangzhou. It is a city in China. I go there with my family. We go by train. It take about two hours. Hangzhou is famous for West Lake. The lake is very beautiful. There are many trees and flowers around the lake. We take a boat on the lake. The water is clean and we can see fish. We also visit a temple. The temple is old and big. There are many people there. We eat some local food. The food is delicious. I like the fish soup very much. We stay there for two days. I take many photos. I want to go again because the city is nice and the people are friendly. The weather was good, not too hot. I think Hangzhou is a good place for holiday.",
    analysis: {
      fluency:
        "Maintains basic flow through short, choppy sentences but with no connective tissue between ideas. Relies on simple subject-verb-object patterns throughout. Barely expands beyond listing activities.",
      vocabulary:
        "Very limited vocabulary restricted to basic adjectives ('beautiful', 'delicious', 'nice', 'good'). No attempt at paraphrasing or less common lexis.",
      grammar:
        "Frequent tense errors: 'I go' and 'We go' instead of past tense, 'It take' missing -s. No complex structures at all. Consistent simple sentence pattern.",
      pronunciation:
        "Likely understandable at a basic level, but intonation is probably flat and segmented due to the staccato sentence structure.",
    },
    highlights: [
      "Tense errors throughout: 'I go there', 'We go by train', 'It take about two hours'",
      "Only simple sentences with no subordination or connectives",
      "Repetitive basic adjectives: 'beautiful', 'delicious', 'nice', 'good'",
    ],
  },
  {
    cueCardId: "p2-recent-visit",
    band: 6,
    answer:
      "I'd like to talk about a place I visited recently, which is Suzhou. It's a city not far from Shanghai, and it's well-known for its classical gardens and water canals. I went there with a couple of friends during the last public holiday, and we took the high-speed train, which only took about thirty minutes. The first thing we did was visit the Humble Administrator's Garden, which is one of the most famous gardens in China. It was really beautiful with all the pavilions, ponds, and rock formations. We also walked around the old town area, where there are lots of small shops and traditional houses along the canals. The atmosphere was quite charming, although it was a bit crowded because of the holiday. We tried some local snacks, like sweet osmanthus cake and biluochun tea, which were really nice. Overall, I'd say Suzhou is a great place for a short trip if you want to experience traditional Chinese culture and architecture. I'd definitely go back, maybe in spring next time.",
    analysis: {
      fluency:
        "Willing to speak at length and covers all points. Uses some connectives ('although', 'and', 'which') but transitions can feel slightly mechanical. Generally coherent with minor lapses.",
      vocabulary:
        "Adequate range with some topic-specific items ('classical gardens', 'pavilions', 'rock formations', 'osmanthus cake'). Generally clear but some reliance on generic adjectives ('really nice', 'great').",
      grammar:
        "Mix of simple and complex structures. Relative clauses used competently ('which is one of', 'where there are'). 'Although' used correctly. Some range but not fully flexible.",
      pronunciation:
        "Generally clear and understandable. Likely uses appropriate intonation for most sentences, though control may not be fully consistent.",
    },
    highlights: [
      "Correct use of 'although' for concession: 'although it was a bit crowded because of the holiday'",
      "Topic-specific vocabulary: 'classical gardens', 'pavilions', 'rock formations', 'biluochun tea'",
      "Relative clauses: 'which only took about thirty minutes', 'where there are lots of small shops'",
    ],
  },
  {
    cueCardId: "p2-recent-visit",
    band: 7,
    answer:
      "I'd like to tell you about a place I visited a few weeks ago — a small coastal town called Dali, in Yunnan province. I'd been meaning to go there for ages, and I finally managed to squeeze in a short trip during a long weekend. What struck me most was the laid-back atmosphere — it's a world away from the hustle and bustle of city life. The old town is full of cobbled streets, traditional Bai-style architecture, and little craft shops selling everything from tie-dye textiles to handmade silver jewellery. I spent a whole afternoon just wandering around without any particular plan, which was wonderfully refreshing. One of the highlights was renting a bike and cycling along Erhai Lake — the views were absolutely breathtaking, with the mountains reflected in the crystal-clear water. I also made a point of trying the local cuisine, and the grilled fish with wild herbs was a real standout. What made the trip special, though, wasn't just the scenery but the sense of slowing down and being present. It's the kind of place that reminds you there's more to life than deadlines and screens.",
    analysis: {
      fluency:
        "Speaks at length without noticeable effort. Uses a range of connectives and discourse markers naturally ('What struck me most', 'One of the highlights', 'What made the trip special'). Coherent throughout.",
      vocabulary:
        "Uses less common and idiomatic vocabulary flexibly: 'hustle and bustle', 'laid-back', 'breathtaking', 'a real standout'. Shows awareness of collocation and style.",
      grammar:
        "Range of complex structures with some flexibility: cleft sentences ('What struck me most was...'), relative clauses, past perfect ('I'd been meaning to'). Frequent error-free sentences.",
      pronunciation:
        "Generally clear and natural. Shows positive features beyond band 7 but may not sustain them consistently throughout.",
    },
    highlights: [
      "'a world away from the hustle and bustle of city life'",
      "'What made the trip special, though, wasn't just the scenery but the sense of slowing down and being present'",
      "'the kind of place that reminds you there's more to life than deadlines and screens'",
    ],
  },
  {
    cueCardId: "p2-recent-visit",
    band: 8,
    answer:
      "I'd like to describe a place I visited recently that exceeded all my expectations — Zhangjiajie, a national forest park in Hunan province. I'd seen photographs of its towering sandstone pillars, but nothing quite prepares you for the sheer scale and otherworldly beauty of the landscape in person. I travelled there with a close friend who shares my passion for hiking, and we spent three days exploring the various trails, each offering a dramatically different perspective on the park. The highlight, without a doubt, was reaching the summit of Tianzi Mountain at dawn — we'd set off in near darkness, and watching the mist gradually clear to reveal hundreds of vertical peaks emerging like sentinels from the valley below was genuinely awe-inspiring. What I hadn't anticipated was how physically demanding the terrain would be, but that only made the views feel more earned. We also had the chance to interact with some of the local Tujia people, whose deep connection to the land added a rich cultural dimension to the experience. It's one of those rare destinations that's as humbling as it is beautiful, and I came back feeling both physically exhausted and mentally reinvigorated.",
    analysis: {
      fluency:
        "Fluent and coherent throughout with only occasional, content-related hesitation. Discourse markers are natural and varied. Develops the topic fully and appropriately.",
      vocabulary:
        "Wide lexical resource used flexibly and precisely: 'otherworldly beauty', 'emerging like sentinels', 'more earned', 'mentally reinvigorated'. Idiomatic and precise throughout.",
      grammar:
        "Flexible use of a wide range of structures. Participial phrases ('watching the mist gradually clear'), relative clauses, and nuanced expressions all used accurately. Virtually error-free.",
      pronunciation:
        "Clear and natural throughout. Uses a wide range of pronunciation features effectively. Easy to understand throughout.",
    },
    highlights: [
      "'hundreds of vertical peaks emerging like sentinels from the valley below'",
      "'as humbling as it is beautiful — physically exhausted and mentally reinvigorated'",
      "'nothing quite prepares you for the sheer scale and otherworldly beauty of the landscape in person'",
    ],
  },
  {
    cueCardId: "p2-recent-visit",
    band: 9,
    answer:
      "I'd like to tell you about a place that completely captivated me on a recent trip — Jiuzhaigou, a nature reserve tucked away in the mountains of Sichuan province. I'd been warned that no amount of photography can truly capture the place, and having now been, I can attest that the reality far surpasses anything a screen could convey. The reserve is a network of multi-tiered waterfalls, kaleidoscopic lakes, and ancient forests, and what makes it so extraordinary is the mineral composition of the water, which creates shades of turquoise and emerald that seem almost impossibly vivid. I was fortunate enough to visit in late autumn, when the surrounding foliage turned shades of amber and crimson, creating a breathtaking contrast with the blue-green water. I spent an entire day hiking along the wooden boardwalks that wind through the valley, and what struck me most was the profound stillness — there's a kind of reverence that settles over you in a place so untouched. I'd add that the local Tibetan communities, who've lived in harmony with this landscape for generations, lend the area a cultural richness that elevates it beyond mere scenic beauty. It was, without hyperbole, one of the most transcendent places I've ever set foot in.",
    analysis: {
      fluency:
        "Effortless, fully natural speech. Develops the topic fully and appropriately. Any hesitation is purely content-related, choosing the most precise expression for a nuanced idea.",
      vocabulary:
        "Completely flexible and precise. Idiomatic and nuanced throughout: 'kaleidoscopic lakes', 'profound stillness', 'without hyperbole', 'transcendent'. Natural and accurate use of uncommon lexical items.",
      grammar:
        "Full range of structures used naturally and appropriately. Complex sentences with multiple subordinate clauses are handled effortlessly. Consistently accurate.",
      pronunciation:
        "Full range of pronunciation features used with precision and subtlety. Effortless to understand throughout, with natural rhythm and intonation.",
    },
    highlights: [
      "'shades of turquoise and emerald that seem almost impossibly vivid'",
      "'there's a kind of reverence that settles over you in a place so untouched'",
      "'without hyperbole, one of the most transcendent places I've ever set foot in'",
    ],
  },

  // ============================================================
  // Topic 3: p2-best-friend — "Describe your best friend"
  // ============================================================
  {
    cueCardId: "p2-best-friend",
    band: 5,
    answer:
      "I want to talk about my best friend. His name is Wang. We know each other from high school. We are in same class. He is tall and he wear glasses. He is very kind person. He always help me when I have problem. We like to play basketball together. We play every weekend. He is good at basketball. He can run fast and shoot well. He also like music. He play guitar. Sometimes he play for me. He want to be a musician in the future. I think he can do it because he practice every day. We also study together. He is good at math. He help me with my homework. We sometimes argue but we always become friend again. I think he is my best friend because he is honest and funny. He make me laugh a lot. I hope we can be friend forever.",
    analysis: {
      fluency:
        "Maintains basic communication through very short, repetitive sentences. No connectives or discourse markers beyond 'and' and 'but'. Little expansion on any point — mostly lists facts.",
      vocabulary:
        "Vocabulary is limited to basic, high-frequency words ('kind', 'funny', 'honest', 'good'). No less common lexis. Repetitive patterns ('He is...', 'He play...').",
      grammar:
        "Frequent basic errors: missing third-person -s ('He wear', 'He play', 'He help', 'He want'), missing articles ('in same class', 'very kind person'). Entirely simple sentences, no complex structures.",
      pronunciation:
        "Likely intelligible at word level but sentence-level features (stress, intonation, chunking) are probably underdeveloped due to the choppy, repetitive structure.",
    },
    highlights: [
      "Consistent third-person singular errors: 'He wear glasses', 'He play guitar', 'He help me'",
      "Only simple sentences with no subordination or connectives beyond 'and'/'but'",
      "Basic, repetitive vocabulary: 'good', 'kind', 'funny' used throughout",
    ],
  },
  {
    cueCardId: "p2-best-friend",
    band: 6,
    answer:
      "I'd like to describe my best friend, whose name is Li. We've known each other since we were in primary school — we actually sat next to each other in class and just started talking one day, and we've been close ever since. He's of average height with short black hair and a very expressive face. What I appreciate most about him is his sense of humour — he has this ability to make light of any situation, which I find really comforting, especially when I'm stressed. We share quite a few interests, like playing video games and watching movies, but we also have our differences. For instance, he's much more outgoing than I am. He's currently working as a graphic designer, which suits him because he's always been creative. Even though we don't see each other as often as we used to, we still keep in touch regularly. I think what makes our friendship strong is that we can be completely honest with each other.",
    analysis: {
      fluency:
        "Willing to speak at length and covers all points. Uses some discourse markers ('What I appreciate most', 'For instance', 'Even though') but transitions can be slightly mechanical at times. Generally coherent.",
      vocabulary:
        "Adequate range with some good expressions ('make light of any situation', 'expressive face', 'keep in touch'). Generally clear but some reliance on common adjectives.",
      grammar:
        "Mix of simple and complex structures. Present perfect ('We've known each other since') used correctly. Relative clauses ('which suits him') and concessive clauses ('Even though') used appropriately. Some range but not fully flexible.",
      pronunciation:
        "Generally clear and understandable. Likely uses appropriate intonation for most sentences, though control of features like sentence stress may be inconsistent.",
    },
    highlights: [
      "Correct present perfect: 'We've known each other since we were in primary school'",
      "Good collocation: 'make light of any situation', 'expressive face'",
      "Concessive clause: 'Even though we don't see each other as often as we used to'",
    ],
  },
  {
    cueCardId: "p2-best-friend",
    band: 7,
    answer:
      "I'd like to tell you about my best friend, Mei, who I've known for the better part of a decade now. We actually met at university during a group project — I remember being immediately struck by how effortlessly she could put people at ease. She has this warm, infectious laugh and a way of making everyone in the room feel included. What I value most about our friendship is her unwavering honesty — she's the kind of person who'll tell you the truth even when it's uncomfortable, but always in a way that's constructive rather than hurtful. We bonded over a shared love of indie films and hiking, and we've made a tradition of going on at least one weekend trip together every year. Professionally, she's a journalist, and I've always admired her tenacity — she's not afraid to ask difficult questions and she genuinely cares about the stories she tells. What keeps us close, I think, is that we've grown together rather than apart — we challenge each other to be better, and there's never any judgement between us. I consider myself incredibly lucky to have her in my life.",
    analysis: {
      fluency:
        "Speaks at length without noticeable effort. Uses a range of connectives and discourse markers naturally ('What I value most', 'What keeps us close, I think'). Coherent and well-developed throughout.",
      vocabulary:
        "Uses less common and idiomatic vocabulary: 'put people at ease', 'infectious laugh', 'unwavering honesty', 'tenacity'. Shows awareness of collocation and style.",
      grammar:
        "Range of complex structures: cleft sentences ('What I value most is...'), relative clauses, comparative constructions ('rather than apart'). Frequent error-free sentences.",
      pronunciation:
        "Generally clear and natural. Shows some positive features of band 8 but not consistently sustained throughout.",
    },
    highlights: [
      "'immediately struck by how effortlessly she could put people at ease'",
      "'the kind of person who'll tell you the truth even when it's uncomfortable, but always in a way that's constructive rather than hurtful'",
      "'we've grown together rather than apart — we challenge each other to be better'",
    ],
  },
  {
    cueCardId: "p2-best-friend",
    band: 8,
    answer:
      "I'd like to talk about my closest friend, Daniel, whom I first met under rather unconventional circumstances — we were both stranded at an airport for eight hours because of a cancelled flight, and what started as a conversation to pass the time quickly revealed an extraordinary meeting of minds. Daniel is the sort of person who reads voraciously across wildly diverse fields, from astrophysics to medieval history, and what I find remarkable is his ability to draw unexpected connections between them in casual conversation. Physically, he's unassuming — tall, slightly stooped, with a quiet demeanour — but once he starts speaking, there's a depth and warmth to him that's genuinely magnetic. What I treasure most about our friendship is the intellectual honesty we share; we can debate fiercely without it ever becoming personal, and I invariably come away from our conversations having reconsidered at least one long-held assumption. He's also remarkably dependable — when my father was ill last year, he drove three hours just to sit with me, no questions asked. It's that combination of intellectual stimulation and emotional constancy that, in my view, defines a truly enduring friendship, and I'm grateful for it every day.",
    analysis: {
      fluency:
        "Fluent and coherent throughout. Hesitation, if any, is content-related. Discourse markers are natural and varied ('what started as', 'what I find remarkable', 'what I treasure most'). Develops the topic fully.",
      vocabulary:
        "Wide lexical resource used flexibly and precisely: 'voraciously', 'unassuming', 'intellectual honesty', 'emotional constancy'. Idiomatic and accurate throughout.",
      grammar:
        "Flexible use of a wide range of structures: cleft sentences, participial phrases, complex relative clauses. Virtually error-free.",
      pronunciation:
        "Clear and natural throughout. Uses a wide range of pronunciation features effectively. Easy to understand throughout.",
    },
    highlights: [
      "'what started as a conversation to pass the time quickly revealed an extraordinary meeting of minds'",
      "'that combination of intellectual stimulation and emotional constancy that defines a truly enduring friendship'",
      "'I invariably come away from our conversations having reconsidered at least one long-held assumption'",
    ],
  },
  {
    cueCardId: "p2-best-friend",
    band: 9,
    answer:
      "I'd like to describe someone who has been my closest confidante for the past fifteen years — a woman named Aisha, whom I met when we were both volunteers at a community literacy programme. From the outset, what struck me about Aisha was her extraordinary capacity for empathy — she possesses this rare ability to listen not just to what people say but to what lies beneath their words, and she responds with a thoughtfulness that makes you feel genuinely seen. She's also formidably intelligent — a paediatric surgeon by profession — yet wears her accomplishments with a self-deprecating humour that instantly puts people at ease. What I find most remarkable about her, though, is her resilience; she has navigated personal hardships that would have embittered most people, emerging with her compassion not just intact but deepened. Our friendship has weathered geographical distance, diverging life trajectories, and the inevitable frictions that come with knowing someone intimately over a long period, yet what endures is a mutual understanding that requires no performance. We can go months without speaking and pick up exactly where we left off, as though no time has elapsed. She challenges me to be more generous, more patient, more courageous, and I can honestly say I'm a better person for having her in my corner.",
    analysis: {
      fluency:
        "Effortless, fully natural speech. Develops the topic with complete fluency and coherence. Any hesitation is purely content-related — selecting the most precise expression.",
      vocabulary:
        "Completely flexible and precise. Idiomatic and nuanced throughout: 'closest confidante', 'what lies beneath their words', 'diverging life trajectories', 'requires no performance'. Natural and accurate.",
      grammar:
        "Full range of structures used naturally and appropriately: complex relative clauses, participial constructions, parallel structures ('more generous, more patient, more courageous'). Consistently accurate.",
      pronunciation:
        "Full range of pronunciation features used with precision and subtlety. Effortless to understand throughout, with natural rhythm and intonation.",
    },
    highlights: [
      "'she possesses this rare ability to listen not just to what people say but to what lies beneath their words'",
      "'emerging with her compassion not just intact but deepened'",
      "'a mutual understanding that requires no performance'",
    ],
  },

  // ============================================================
  // Topic 4: p2-happy-event — "Describe a happy event you remember"
  // ============================================================
  {
    cueCardId: "p2-happy-event",
    band: 5,
    answer:
      "I want to talk about a happy event. It was my birthday last year. I was 20 years old. My family make a party for me. I didn't know about the party. It was a surprise. My mother call me to come home early. When I open the door, all my friends was there. They say 'Happy Birthday!' I was very surprised and happy. There was a big cake. The cake was chocolate. It is my favorite. My friends give me many presents. I got a new phone from my parents. I was so excited. We eat the cake and play games. We also sing songs. My father take many photos. The party was in the evening. We had fun all night. I think it was the best birthday. I will remember it forever. I want to say thank you to my family and my friends. They make me feel very special.",
    analysis: {
      fluency:
        "Maintains basic communication through short, simple sentences. No connectives beyond 'and'. Repetitive sentence openings ('I', 'We', 'My'). Little expansion on any point.",
      vocabulary:
        "Limited to basic, high-frequency words ('happy', 'surprised', 'excited', 'fun'). No less common lexis. Repetitive structure throughout.",
      grammar:
        "Frequent errors: tense inconsistency ('My mother call' instead of 'called', 'They say' instead of 'said', 'We eat' instead of 'ate', 'My father take' instead of 'took'). Subject-verb agreement error ('all my friends was'). No complex structures.",
      pronunciation:
        "Likely understandable at a basic level, but sentence stress and intonation are probably flat due to the monotonous sentence structure.",
    },
    highlights: [
      "Frequent past tense errors: 'My mother call', 'They say', 'We eat', 'My father take'",
      "Subject-verb agreement error: 'all my friends was there'",
      "Only simple sentences with no subordination or connectives beyond 'and'",
    ],
  },
  {
    cueCardId: "p2-happy-event",
    band: 6,
    answer:
      "I'd like to talk about a happy event that I remember well, which was my graduation ceremony from university last year. It took place in the main auditorium on campus, and all the graduates were dressed in caps and gowns. My parents and my younger sister came to watch, and I could see them in the audience looking really proud. The ceremony itself was quite formal — there were speeches from the professors, and then we walked across the stage one by one to receive our diplomas. When it was my turn, I felt a mixture of excitement and nervousness. After the ceremony, we took lots of photos outside, and then we went out for a big dinner to celebrate. My parents even gave me a watch that I'd been wanting for a long time. What made the day really special was the feeling that all my hard work over the past four years had finally paid off. It was one of the happiest days I can remember.",
    analysis: {
      fluency:
        "Willing to speak at length and covers all points. Uses some connectives ('and then', 'After the ceremony') and organises events chronologically. Generally coherent with minor lapses in flow.",
      vocabulary:
        "Adequate range with some good expressions ('mixture of excitement and nervousness', 'finally paid off'). Generally clear but some reliance on common adjectives ('really proud', 'really special').",
      grammar:
        "Mix of simple and complex structures. Past perfect ('I'd been wanting') used correctly. Relative clause ('that I'd been wanting', 'that all my hard work... had finally paid off') used appropriately. Some range but not fully flexible.",
      pronunciation:
        "Generally clear and understandable. Likely uses appropriate intonation for most sentences, though feature control may be inconsistent.",
    },
    highlights: [
      "Correct past perfect: 'a watch that I'd been wanting for a long time'",
      "Good expression: 'a mixture of excitement and nervousness'",
      "Relative clause: 'the feeling that all my hard work over the past four years had finally paid off'",
    ],
  },
  {
    cueCardId: "p2-happy-event",
    band: 7,
    answer:
      "I'd like to share a happy event that stands out in my memory — the day my younger brother was born. I was eight years old at the time, and I remember being dropped off at my aunt's house while my parents went to the hospital. I was too young to fully grasp what was happening, but I was buzzing with excitement. When my father finally came to pick me up and told me I had a baby brother, I can still vividly recall the rush of pure joy I felt. Walking into the hospital room and seeing my mother holding this tiny, wrinkled little human was one of the most overwhelming moments of my childhood. He was so small and fragile, and I remember being almost afraid to hold him at first. What made the occasion truly special, though, was seeing how happy my parents were — there was this incredible warmth in the room that I've never quite forgotten. Looking back, I think that was the moment I first understood what it means to love someone unconditionally. It's a memory I treasure, and my brother and I are still incredibly close to this day.",
    analysis: {
      fluency:
        "Speaks at length without noticeable effort. Uses a range of connectives and discourse markers naturally ('When my father finally came', 'What made the occasion truly special', 'Looking back'). Coherent and well-developed.",
      vocabulary:
        "Uses less common and idiomatic vocabulary: 'buzzing with excitement', 'rush of pure joy', 'wrinkled little human', 'unconditionally'. Shows awareness of collocation and style.",
      grammar:
        "Range of complex structures: cleft sentence ('What made the occasion truly special was...'), gerund subjects ('Walking into the hospital room... seeing my mother'), past perfect ('told me I had a baby brother'). Frequent error-free sentences.",
      pronunciation:
        "Generally clear and natural. Shows some positive features of band 8 but not consistently sustained.",
    },
    highlights: [
      "'I can still vividly recall the rush of pure joy I felt'",
      "'this tiny, wrinkled little human was one of the most overwhelming moments of my childhood'",
      "'the moment I first understood what it means to love someone unconditionally'",
    ],
  },
  {
    cueCardId: "p2-happy-event",
    band: 8,
    answer:
      "I'd like to describe one of the happiest moments of my life — the day I received the acceptance letter for a scholarship to study abroad. I'd been working towards this for over a year, juggling my regular studies with exam preparation, essay writing, and countless mock interviews, so when the email finally arrived, I almost couldn't bring myself to open it. I was at home alone, and I remember staring at the subject line for what felt like an eternity before clicking. When I read the word 'congratulations,' the relief was so overwhelming that I actually sank to the floor and just sat there for a few minutes, processing it. I called my parents immediately, and my mother burst into tears — she'd seen how much sacrifice had gone into this, and I think for her it was as much a release as it was a celebration. What made it so profoundly joyful wasn't just the achievement itself, but the realisation that the door to a future I'd only dared to imagine was now genuinely open. That evening, we had a quiet family dinner, and I remember feeling an almost unbearable lightness, as though a tremendous weight had been lifted from my shoulders.",
    analysis: {
      fluency:
        "Fluent and coherent throughout. Hesitation, if any, is content-related. Discourse markers are natural and varied ('so when the email finally arrived', 'What made it so profoundly joyful'). Develops the topic fully and effectively.",
      vocabulary:
        "Wide lexical resource used flexibly and precisely: 'juggling', 'what felt like an eternity', 'as much a release as it was a celebration', 'unbearable lightness'. Idiomatic and accurate throughout.",
      grammar:
        "Flexible use of a wide range of structures: past perfect continuous ('I'd been working towards'), participial phrases, cleft sentences. Virtually error-free.",
      pronunciation:
        "Clear and natural throughout. Uses a wide range of pronunciation features effectively. Easy to understand throughout.",
    },
    highlights: [
      "'the relief was so overwhelming that I actually sank to the floor'",
      "'as much a release as it was a celebration'",
      "'an almost unbearable lightness, as though a tremendous weight had been lifted from my shoulders'",
    ],
  },
  {
    cueCardId: "p2-happy-event",
    band: 9,
    answer:
      "I'd like to recount what I can only describe as one of the most transcendent moments of my life — a spontaneous evening I shared with strangers in a small town in Portugal. I'd been travelling alone, somewhat wearily, and had wandered into a modest family-run restaurant where, by some stroke of serendipity, I was the only customer. The owner, an elderly woman of formidable warmth, insisted on cooking me a meal that clearly far exceeded what I'd ordered, and before long her family began trickling in — a son with a guitar, a daughter-in-law with a bottle of homemade wine, and two grandchildren who clambered onto chairs to watch. What unfolded was an evening of music, laughter, and conversation conducted in a patchwork of broken English and equally broken Portuguese, yet somehow conveying more genuine connection than I'd experienced in months of fluent exchanges back home. There was a moment, halfway through a fado song I didn't understand, when the grandmother placed her hand over mine and simply smiled, and I was struck by the most profound sense of belonging — not to a place, but to something larger and more universal. It was happiness of a kind I hadn't known was possible: unforced, unplanned, and utterly without pretence.",
    analysis: {
      fluency:
        "Effortless, fully natural speech. Develops the topic fully and appropriately. Any hesitation is purely content-related, selecting the most precise and nuanced expression.",
      vocabulary:
        "Completely flexible and precise. Idiomatic and nuanced throughout: 'stroke of serendipity', 'formidable warmth', 'patchwork of broken English', 'utterly without pretence'. Natural and accurate.",
      grammar:
        "Full range of structures used naturally and appropriately: participial phrases ('having wandered into'), relative clauses of varying complexity, comparative constructions. Consistently accurate.",
      pronunciation:
        "Full range of pronunciation features used with precision and subtlety. Effortless to understand throughout, with natural rhythm and intonation.",
    },
    highlights: [
      "'by some stroke of serendipity, I was the only customer'",
      "'conducted in a patchwork of broken English and equally broken Portuguese, yet somehow conveying more genuine connection'",
      "'happiness of a kind I hadn't known was possible: unforced, unplanned, and utterly without pretence'",
    ],
  },

  // ============================================================
  // Topic 5: p2-relax — "Describe something you do to relax"
  // ============================================================
  {
    cueCardId: "p2-relax",
    band: 5,
    answer:
      "I want to talk about how I relax. I like to watch TV. I watch TV every day after work. I usually watch movies or drama. I like comedy very much. Comedy make me laugh. When I laugh, I feel relax. I sit on the sofa and eat snacks. Sometimes I watch with my family. We watch together and talk about the story. I also like to watch on my phone before sleep. I think watching TV is good way to relax because it is easy. I don't need to think. I just watch and enjoy. I like Korean drama. The story is interesting and the actors are handsome. I watch one or two episode every night. On weekend, I watch more. I think everyone should find a way to relax. For me, TV is the best.",
    analysis: {
      fluency:
        "Maintains basic communication through short, simple sentences. No connectives beyond 'and' and 'because'. Repetitive sentence openings ('I'). Minimal expansion on points.",
      vocabulary:
        "Very limited vocabulary: basic words ('relax', 'watch', 'interesting', 'handsome'). No less common lexis. Repetitive use of 'watch' and 'like'.",
      grammar:
        "Frequent errors: 'Comedy make me laugh' (subject-verb agreement), 'I feel relax' (adjective form), 'good way' (missing article), 'one or two episode' (missing plural -s). Entirely simple sentences.",
      pronunciation:
        "Likely understandable at a basic level, but sentence rhythm and intonation are probably flat and repetitive.",
    },
    highlights: [
      "Subject-verb agreement error: 'Comedy make me laugh'",
      "Adjective form error: 'I feel relax' instead of 'relaxed'",
      "Missing article and plural: 'good way to relax', 'one or two episode'",
    ],
  },
  {
    cueCardId: "p2-relax",
    band: 6,
    answer:
      "I'd like to talk about something I do to relax, which is going for a run in the park near my house. I started this habit about a year ago when I was feeling quite stressed from work, and a colleague suggested that exercise might help. There's a large park not far from where I live, and it has a running track that goes around a small lake. I usually go there in the early evening, when the weather is cooler and there aren't too many people around. When I run, I try not to think about work — I just focus on my breathing and the scenery. Sometimes I listen to music, which makes it more enjoyable. After about thirty minutes, I always feel much better physically and mentally. I think the reason it helps me relax is that it gives me a break from screens and allows me to clear my head. It's become an important part of my routine.",
    analysis: {
      fluency:
        "Willing to speak at length and covers all points. Uses some connectives ('when', 'which', 'and') and organises ideas logically. Generally coherent with minor lapses in flow.",
      vocabulary:
        "Adequate range with some good expressions ('clear my head', 'physically and mentally', 'an important part of my routine'). Generally clear but some reliance on common vocabulary.",
      grammar:
        "Mix of simple and complex structures. Relative clauses ('which is going for a run', 'that goes around a small lake', 'that exercise might help') used correctly. Time clauses ('when I was feeling', 'when the weather is cooler') handled well. Some range but not fully flexible.",
      pronunciation:
        "Generally clear and understandable. Likely uses appropriate intonation for most sentences, though feature control may be inconsistent.",
    },
    highlights: [
      "Correct relative clauses: 'which is going for a run', 'that goes around a small lake'",
      "Good expression: 'clear my head', 'physically and mentally'",
      "Time clauses: 'when I was feeling quite stressed', 'when the weather is cooler'",
    ],
  },
  {
    cueCardId: "p2-relax",
    band: 7,
    answer:
      "I'd like to describe what I do to unwind, which is baking — specifically, making bread from scratch. I picked it up during the pandemic when I, like many people, was looking for a way to fill the time, and it quickly became something I genuinely look forward to. There's something deeply satisfying about the entire process — the tactile pleasure of kneading the dough, the patience required while it proves, and the almost meditative rhythm of shaping it into a loaf. I find it incredibly grounding because it demands a kind of focused attention that forces you to be fully present. You can't rush bread — it rises on its own schedule, and I've learned that the hard way. What I particularly enjoy is experimenting with different recipes — I've tried everything from sourdough to brioche to focaccia, and each one has its own personality. The smell of fresh bread filling the kitchen is, for me, one of life's simple pleasures. And of course, there's the added bonus of sharing the results with family and friends. It's a small ritual that brings me a real sense of calm and accomplishment.",
    analysis: {
      fluency:
        "Speaks at length without noticeable effort. Uses a range of connectives and discourse markers naturally ('There's something deeply satisfying about', 'What I particularly enjoy', 'And of course'). Coherent and well-developed.",
      vocabulary:
        "Uses less common and idiomatic vocabulary: 'unwind', 'from scratch', 'tactile pleasure', 'incredibly grounding', 'meditative rhythm'. Shows awareness of collocation and style.",
      grammar:
        "Range of complex structures: gerund subjects ('making bread from scratch', 'experimenting with different recipes'), relative clauses, parallel constructions. Frequent error-free sentences.",
      pronunciation:
        "Generally clear and natural. Shows some positive features of band 8 but not consistently sustained.",
    },
    highlights: [
      "'the tactile pleasure of kneading the dough, the patience required while it proves, and the almost meditative rhythm of shaping it into a loaf'",
      "'it demands a kind of focused attention that forces you to be fully present'",
      "'one of life's simple pleasures'",
    ],
  },
  {
    cueCardId: "p2-relax",
    band: 8,
    answer:
      "I'd like to talk about something that has become an indispensable part of my unwinding routine — the practice of Japanese ink painting, or sumi-e. I stumbled upon it almost by accident, having enrolled in a community class on a whim, but I quickly found it to be one of the most absorbing and restorative activities I've ever undertaken. The essence of sumi-e lies in its deceptiveness — the strokes appear simple, yet executing them with the right balance of pressure, speed, and intention requires a level of concentration that effectively silences the mental chatter of the day. There's a profound elegance in the constraint of working with a single colour, a single brush, and the unforgiving medium of rice paper, where every mark is permanent and there's no scope for revision. I typically set aside an hour on weekend mornings, and I've come to cherish that window of quiet focus. What I find particularly valuable is how the principles of the practice — patience, restraint, and acceptance of imperfection — seem to seep into other areas of my life. It's not merely a hobby but, in a very real sense, a form of moving meditation that leaves me noticeably calmer and more centred.",
    analysis: {
      fluency:
        "Fluent and coherent throughout. Hesitation, if any, is content-related. Discourse markers are natural and varied ('The essence of sumi-e lies in', 'What I find particularly valuable'). Develops the topic fully and effectively.",
      vocabulary:
        "Wide lexical resource used flexibly and precisely: 'indispensable', 'restorative', 'mental chatter', 'unforgiving medium', 'moving meditation'. Idiomatic and accurate throughout.",
      grammar:
        "Flexible use of a wide range of structures: participial phrases ('having enrolled in', 'where every mark is permanent'), parallel constructions, complex relative clauses. Virtually error-free.",
      pronunciation:
        "Clear and natural throughout. Uses a wide range of pronunciation features effectively. Easy to understand throughout.",
    },
    highlights: [
      "'a level of concentration that effectively silences the mental chatter of the day'",
      "'the unforgiving medium of rice paper, where every mark is permanent and there's no scope for revision'",
      "'a form of moving meditation that leaves me noticeably calmer and more centred'",
    ],
  },
  {
    cueCardId: "p2-relax",
    band: 9,
    answer:
      "I'd like to describe something that has become, quite unexpectedly, my most effective means of decompression — tending to a small allotment garden I took over a couple of years ago. What began as a modest attempt to grow a few herbs has evolved into a genuine passion that consumes most of my weekend mornings, and I've come to regard that patch of earth as a sanctuary of sorts. There's an inherently restorative quality to working with soil — the tactile connection, the rhythm of planting and pruning, the quiet satisfaction of watching something flourish under your care. But what I find most compelling is the way it recalibrates one's sense of time; the garden operates on its own calendar, indifferent to deadlines or digital notifications, and there's something profoundly liberating about submitting to that slower tempo. I've also discovered an unexpected community among my fellow allotment holders — a wonderfully eccentric cast of characters who generously share cuttings, advice, and the occasional philosophical reflection over a cup of tea. It's taught me patience in a way that nothing else has, and I've come to appreciate that the true reward lies not in the harvest, satisfying as that is, but in the act of cultivation itself — the daily, quiet commitment to nurturing something beyond oneself.",
    analysis: {
      fluency:
        "Effortless, fully natural speech. Develops the topic fully and appropriately. Any hesitation is purely content-related, selecting the most precise and nuanced expression.",
      vocabulary:
        "Completely flexible and precise. Idiomatic and nuanced throughout: 'means of decompression', 'sanctuary of sorts', 'recalibrates one's sense of time', 'a wonderfully eccentric cast of characters'. Natural and accurate.",
      grammar:
        "Full range of structures used naturally and appropriately: participial phrases, semicolon-separated constructions, comparative and concessive clauses. Consistently accurate.",
      pronunciation:
        "Full range of pronunciation features used with precision and subtlety. Effortless to understand throughout, with natural rhythm and intonation.",
    },
    highlights: [
      "'the garden operates on its own calendar, indifferent to deadlines or digital notifications'",
      "'a wonderfully eccentric cast of characters who generously share cuttings, advice, and the occasional philosophical reflection'",
      "'the true reward lies not in the harvest, satisfying as that is, but in the act of cultivation itself'",
    ],
  },
];
