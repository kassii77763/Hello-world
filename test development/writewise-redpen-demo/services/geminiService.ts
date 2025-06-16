
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { FeedbackItem } from '../types';
import { GEMINI_MODEL_NAME, SAMPLE_FEEDBACK_ITEMS, PurposeType, ToneType, PURPOSE_OPTIONS, TONE_OPTIONS, DEFAULT_INCLUDE_POSITIVE_FEEDBACK } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. Using mock data. Please set the API_KEY environment variable.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const PROMPT_TEMPLATE = (text: string, purpose: PurposeType, tone: ToneType, includePositive: boolean) => {
  const purposeLabel = PURPOSE_OPTIONS.find(p => p.value === purpose)?.label || purpose;
  const toneLabel = TONE_OPTIONS.find(t => t.value === tone)?.label || tone;

  let positiveFeedbackInstruction = "改善点や修正が必要な箇所に焦点を当ててください。現時点では、文章の良い点に関するコメントは不要です。";
  if (includePositive) {
    positiveFeedbackInstruction = `改善点に加え、文章の良い点や特に優れている点も積極的に含めてください。
その際は type を "positive-feedback" としてください。
"positive-feedback" の場合、"suggestion" フィールドは、そのままで良いことを示すために元の 'target_text' をそのまま記述するか、空文字列("")にしてください。
良い点に対するコメントは "comment" フィールドに記述してください。`;
  }

  return `
あなたは経験豊富な校正者です。
今回の校正の目的は「${purposeLabel}」です。
フィードバックのトーンは「${toneLabel}」でお願いします。
${positiveFeedbackInstruction}

以下の文章を分析し、フィードバックを提供してください。
各フィードバックについて、コメント対象となる具体的なテキストセグメント（"target_text"）を特定してください。
問題点を説明する"comment"と、改善のための"suggestion"を提供してください。
フィードバックのタイプ（例："grammar"、"clarity"、"style"、"suggestion"、"positive-feedback"など）を"type"として分類してください。
関連するタグを"tag"として配列で割り当ててください。
各フィードバック項目に、"cmt-XXX"（XXXは数字）の形式でユニークなID（"id"）を生成してください。

回答は、フィードバックオブジェクトのJSON配列のみで構成してください。JSONの前後に説明文を含めないでください。
配列内の各オブジェクトは、以下の構造に従う必要があります：
{
  "target_text": "原文から修正が必要な正確なフレーズ、または言及する良い部分。",
  "comment": "問題に関する簡潔な説明や、修正の意図、背景などを記述してください。良い点の場合は、その評価を記述します。",
  "suggestion": "提案された具体的な修正後のテキスト断片。これは元の 'target_text' と完全に置き換わるものです。説明や指示、追加のコメントはこのフィールドに含めず、'comment' フィールドに記述してください。もし 'target_text' を削除すべき場合は、空文字列(\"\")にしてください。良い点の場合、suggestionは空文字列か元のtarget_textです。",
  "type": "「suggestion」、「error」、「clarity」、「style」、「positive-feedback」などのカテゴリ。",
  "tag": ["関連する", "キーワード"],
  "id": "cmt-XXX"
}
${includePositive ? `例として、positive-feedback の場合は以下のようになります:
{
  "target_text": "この導入部分は素晴らしいです。",
  "comment": "読者の興味を引きつけ、主題を明確に示しています。",
  "suggestion": "この導入部分は素晴らしいです。", 
  "type": "positive-feedback",
  "tag": ["導入", "表現力"],
  "id": "cmt-004"
}` : ""}

分析対象のテキスト（最大${process.env.MAX_INPUT_LENGTH || 10000}文字）:
---
${text}
---
`;
}


export const getAiFeedback = async (text: string, purpose: PurposeType, tone: ToneType, includePositive: boolean): Promise<FeedbackItem[]> => {
  if (!ai) {
    console.log("Gemini API key not configured. Returning mock feedback.");
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Simulate positive feedback if requested
    const itemsToReturn = [...SAMPLE_FEEDBACK_ITEMS];
    if (includePositive) {
        itemsToReturn.push({
            id: "cmt-999",
            target_text: "このデモアプリでは、手書き風のフィードバックにより、温かみのある添削体験を目指しています。",
            comment: "この目標設定は明確で、アプリのユニークな価値提案をよく表しています。素晴らしいです！",
            suggestion: "このデモアプリでは、手書き風のフィードバックにより、温かみのある添削体験を目指しています。",
            type: "positive-feedback",
            tag: ["コンセプト", "UX"]
        });
    }
    return JSON.parse(JSON.stringify(itemsToReturn));
  }

  try {
    const prompt = PROMPT_TEMPLATE(text, purpose, tone, includePositive);
    console.log("Sending prompt to Gemini with includePositive:", includePositive, "\nPrompt:", prompt);

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^\s*```(\w*)?\s*\n?(.*?)\n?\s*```\s*$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);

    if (Array.isArray(parsedData) && parsedData.every(item => 
        typeof item.id === 'string' &&
        typeof item.target_text === 'string' &&
        typeof item.comment === 'string' &&
        (typeof item.suggestion === 'string' || item.suggestion === null) && 
        typeof item.type === 'string' &&
        Array.isArray(item.tag)
    )) {
      return parsedData.map(item => ({ ...item, suggestion: item.suggestion === null ? "" : item.suggestion })) as FeedbackItem[];
    } else {
      console.error("Parsed data is not in the expected FeedbackItem[] format:", parsedData);
      throw new Error("AI response format is incorrect.");
    }

  } catch (error) {
    console.error("Error fetching AI feedback:", error);
    throw new Error(`Failed to get AI feedback: ${error instanceof Error ? error.message : String(error)}. Ensure your API key is valid and the model is accessible.`);
  }
};
