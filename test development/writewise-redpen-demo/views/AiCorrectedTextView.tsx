
import React, { useMemo } from 'react';
import type { FeedbackItem } from '../types';
import LoadingIcon from '../components/LoadingIcon';
import ErrorDisplay from '../components/ErrorDisplay';

interface AiCorrectedTextViewProps {
  submittedText: string;
  feedbackItems: FeedbackItem[];
  isLoading: boolean;
  error: string | null;
}

const generateCorrectedText = (
  originalText: string,
  feedback: FeedbackItem[]
): string => {
  if (!originalText) {
    return "元のテキストがありません。";
  }
  if (!feedback || feedback.length === 0) {
    return originalText; // No feedback, return original
  }

  // Create a list of replacements with their original start indices
  const replacements = feedback
    .map(item => {
      // Find all occurrences to correctly identify the segment
      // This simple indexOf is okay if target_text segments are unique enough
      // For more complex scenarios, a more robust segment identification would be needed
      const startIndex = originalText.indexOf(item.target_text);
      
      if (startIndex === -1) {
        // console.warn(`Target text "${item.target_text}" (ID: ${item.id}) not found in original text. This item will not be applied.`);
        return null; 
      }
      return {
        id: item.id, // Keep ID for potential debugging
        startIndex,
        endIndex: startIndex + item.target_text.length,
        originalSegment: item.target_text,
        suggestion: item.suggestion, // suggestion is guaranteed to be a string by geminiService
      };
    })
    .filter(Boolean) as { id: string; startIndex: number; endIndex: number; originalSegment: string; suggestion: string }[];

  // Sort by start index. If start indices are the same, prioritize longer original segments.
  replacements.sort((a, b) => {
    if (a.startIndex !== b.startIndex) {
      return a.startIndex - b.startIndex;
    }
    return b.originalSegment.length - a.originalSegment.length; // Longer segment first
  });
  
  // Filter out overlapping replacements.
  // This greedy approach keeps the first valid segment and discards subsequent ones that overlap.
  const uniqueReplacements = [];
  let lastProcessedEndIndex = -1;
  for (const rep of replacements) {
      // Only process if the current segment starts at or after the end of the last processed one.
      if (rep.startIndex >= lastProcessedEndIndex) {
          uniqueReplacements.push(rep);
          lastProcessedEndIndex = rep.endIndex;
      } else {
        // console.warn(`Skipping overlapping or contained feedback item ID ${rep.id} ("${rep.originalSegment}") as it overlaps with a previously processed segment.`);
      }
  }

  let correctedText = "";
  let currentIndex = 0;

  uniqueReplacements.forEach(rep => {
    // Append the part of the original text before the current target_text
    correctedText += originalText.substring(currentIndex, rep.startIndex);
    // Append the suggestion (if suggestion is empty string, it means "delete")
    correctedText += rep.suggestion;
    // Move the current index past the original target_text
    currentIndex = rep.endIndex;
  });

  // Append any remaining part of the original text
  if (currentIndex < originalText.length) {
    correctedText += originalText.substring(currentIndex);
  }

  return correctedText;
};


const AiCorrectedTextView: React.FC<AiCorrectedTextViewProps> = ({
  submittedText,
  feedbackItems,
  isLoading,
  error,
}) => {
  const correctedText = useMemo(() => {
    if (isLoading || error || !submittedText) return ""; // Don't compute if loading, error, or no text
    return generateCorrectedText(submittedText, feedbackItems);
  }, [submittedText, feedbackItems, isLoading, error]);

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="text-center">
          <LoadingIcon />
          <p className="mt-2 text-lg font-patrick-hand text-gray-600">AI修正案を生成中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <ErrorDisplay message={`AI修正案の表示中にエラーが発生しました: ${error}`} />
        </div>
      </div>
    );
  }
  
  if (!submittedText) {
    return (
        <div className="flex-grow flex items-center justify-center p-6 text-center">
            <div className="p-8 bg-white shadow-xl rounded-lg border border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-patrick-hand text-xl text-gray-500">テキストがありません</p>
                <p className="text-sm mt-1 text-gray-400">まず「テキスト入力」タブで文章を入力し、フィードバックを取得してください。</p>
            </div>
        </div>
    );
  }
  
  if (feedbackItems.length === 0) {
     return (
        <div className="flex-grow flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-2xl bg-white p-8 shadow-xl rounded-lg border border-gray-200">
            <h2 className="font-patrick-hand text-2xl sm:text-3xl text-rose-700 mb-6 text-center">
              AI修正案
            </h2>
            <p className="text-gray-600 mb-4">
              元のテキスト:
            </p>
            <pre className="whitespace-pre-wrap p-4 bg-gray-50 rounded-md border border-gray-200 text-gray-800 leading-relaxed text-base overflow-x-auto">
              {submittedText}
            </pre>
            <p className="text-gray-600 mt-6 text-center">
              利用可能なフィードバック項目がないため、修正案は生成されていません。
            </p>
          </div>
        </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-4xl bg-white p-6 sm:p-8 shadow-2xl rounded-xl border border-gray-200">
        <h2 className="font-patrick-hand text-2xl sm:text-3xl text-rose-700 mb-6 text-center">
          AIによる修正案適用後テキスト
        </h2>
        <div 
            className="whitespace-pre-wrap p-4 sm:p-6 bg-rose-50/30 rounded-lg border border-rose-200 text-gray-800 leading-relaxed text-base sm:text-lg shadow-inner"
            aria-label="AI corrected text"
        >
          {correctedText}
        </div>
        <p className="mt-6 text-xs text-gray-500 text-center">
          注意: これはAIによって自動生成された修正案です。必ずしも完璧ではない場合があるため、最終的な判断はご自身で行ってください。
        </p>
      </div>
    </div>
  );
};

export default AiCorrectedTextView;
