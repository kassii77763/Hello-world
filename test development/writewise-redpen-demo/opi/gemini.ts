// /api/gemini.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

// Vercelの環境変数からAPIキーを安全に読み込む
const API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // POSTリクエスト以外は受け付けない
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  
  if (!API_KEY) {
    return res.status(500).json({ error: "API key is not configured." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const { prompt } = req.body; // フロントエンドから送られてきたプロンプトを受け取る

    const response = await ai.models.generateContent({
      model: "gemini-pro", // モデル名は適宜調整
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    // Googleからの返事をそのままフロントエンドに返す
    res.status(200).json(response);

  } catch (error) {
    console.error("Error fetching AI feedback:", error);
    res.status(500).json({ error: "Failed to get AI feedback." });
  }
}