
export const DEFAULT_INPUT_TEXT = "これはユーザーが入力する文章の冒頭部分です。この文章は読みにくい。そして、ここにさらなるテキストが続きます。句読点の使い方がまちがっている。さらに、表現を改善できる箇所もあります。\nAIによる添削は、文章の品質を向上させる手助けとなります。例えば、もっと具体的に書くことで、読者の理解を深めることができます。\nこのデモアプリでは、手書き風のフィードバックにより、温かみのある添削体験を目指しています。";

export const GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17";

export const MAX_INPUT_LENGTH = 10000; // Updated from 1000 to 10000

export const SAMPLE_FEEDBACK_ITEMS: import('./types').FeedbackItem[] = [
  {
    "id": "cmt-001",
    "target_text": "この文章は読みにくい。",
    "comment": "語順が不自然です。主語を明確にし、文の構造を整理するとより自然になります。",
    "suggestion": "この読みにくい文章は、語順を見直すと良いでしょう。",
    "type": "suggestion",
    "tag": ["語順", "構成"]
  },
  {
    "id": "cmt-002",
    "target_text": "句読点の使い方がまちがっている。",
    "comment": "句読点の誤りがあります。「まちがっている」はひらがなより漢字「間違っている」が適切です。また、文末は句点「。」で終えるのが一般的です。",
    "suggestion": "句読点の使い方が間違っています。",
    "type": "grammar",
    "tag": ["句読点", "表記"]
  },
  {
    "id": "cmt-003",
    "target_text": "表現を改善できる箇所もあります。",
    "comment": "より具体的な表現にすることで、意図が明確に伝わります。",
    "suggestion": "より具体的な表現を用いることで、改善できる箇所もあります。",
    "type": "clarity",
    "tag": ["表現", "明確性"]
  }
];

// Feedback Settings
export type PurposeType = "general" | "seo" | "academic" | "sns" | "business";
export type ToneType = "gentle" | "direct" | "critical" | "encouraging" | "formal";

export const PURPOSE_OPTIONS: { value: PurposeType; label: string }[] = [
  { value: "general", label: "一般的な添削" },
  { value: "seo", label: "SEO向け（検索エンジン最適化）" },
  { value: "academic", label: "学術的（論理性・客観性重視）" },
  { value: "business", label: "ビジネス文書（明確・簡潔）" },
  { value: "sns", label: "SNS投稿（エンゲージメント重視）" },
];

export const TONE_OPTIONS: { value: ToneType; label: string }[] = [
  { value: "gentle", label: "やさしく（丁寧な言葉遣い）" },
  { value: "direct", label: "ストレートに（単刀直入）" },
  { value: "critical", label: "少し厳しく（改善点を明確に指摘）" },
  { value: "encouraging", label: "励ましながら（ポジティブなフィードバック）" },
  { value: "formal", label: "フォーマル（公式な場に合う表現）" },
];

export const DEFAULT_PURPOSE: PurposeType = "general";
export const DEFAULT_TONE: ToneType = "gentle";
export const DEFAULT_INCLUDE_POSITIVE_FEEDBACK: boolean = false;
