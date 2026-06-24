# Voice Coach P1 Benchmark

Frank's request: benchmark Hi Echo-style AI speaking products and make SpeakLoop feel like a real oral-English coach, not a text chat with speech-to-text.

## Reference Signals

- Hi Echo official site: https://hiecho.youdao.com/
- App Store Hi Echo listing: https://apps.apple.com/sa/app/hi-echo-%E8%99%9A%E6%8B%9F%E4%BA%9A%E5%8F%A3%E8%AF%AD%E7%A7%81%E6%95%99-%E5%8F%A3%E8%AF%AD%E5%AD%A6%E4%B9%A0%E6%96%B9%E6%A1%88%E8%A7%A3%E5%86%B3%E8%80%85/id6454838455
- Hi Echo 3.0 report: https://gaokao.eol.cn/jiazhang/zhukao/202406/t20240604_2614214.shtml

The public benchmark pattern is: virtual speaking coach, multi-round oral dialogue, scene/topic coverage, scoring/report, pronunciation/grammar/vocabulary feedback, and personalized improvement.

## Current SpeakLoop Coverage

Already present:

- Workplace scenario/task role-play.
- Browser ASR for user voice input when supported.
- AI multi-round follow-up through `/api/coach`.
- Assessment report with score range, sentence rewrites, repeat sentences, and task completion feedback.
- Account + Memory P1 code-ready path for personalized profile/history/memory.

Added in Voice Coach P1 first slice:

- AI spoken reply through browser SpeechSynthesis.
- AI reply auto-plays after each coach turn.
- Replay last coach turn.
- Stop current coach audio.
- Visible voice mode status and fallback state.
- Observable latency from user send to AI audio playback start.

## P1 Acceptance

Must pass:

- User can speak or type; speech recognition failure falls back to text.
- AI coach replies in audio automatically after each dialogue turn.
- Transcript remains visible as support, not the primary experience.
- User can replay and stop AI coach audio.
- UI shows whether voice mode is active or degraded.
- UI shows latest response latency.
- Reports still cite user answers and save into history/memory when logged in.

Not in this slice:

- Server-side TTS vendor with consistent voice across browsers.
- Real digital human/avatar with lip sync.
- Audio recording storage and pronunciation scoring from raw audio.
- IELTS official exam simulation and broad topic library.

## Next Implementation Layer

For a stronger Hi Echo-style experience, replace browser SpeechSynthesis with a server-side TTS provider and persist audio metadata per turn:

- `practice_turns.audio_url`
- `practice_turns.asr_confidence`
- `practice_turns.response_latency_ms`
- `assessment_reports.pronunciation_feedback`

This is required before claiming stable voice quality across iPhone Safari and Android browsers.
