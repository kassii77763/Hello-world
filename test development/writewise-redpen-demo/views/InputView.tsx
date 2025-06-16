
import React, { useState, useEffect } from 'react';
import LoadingIcon from '../components/LoadingIcon';
import ErrorDisplay from '../components/ErrorDisplay';
import { PURPOSE_OPTIONS, TONE_OPTIONS, PurposeType, ToneType } from '../constants';

interface InputViewProps {
  initialText: string;
  onGetFeedback: (textToSubmit: string, purpose: PurposeType, tone: ToneType, includePositive: boolean) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  maxInputLength: number;
  selectedPurpose: PurposeType;
  onPurposeChange: (purpose: PurposeType) => void;
  selectedTone: ToneType;
  onToneChange: (tone: ToneType) => void;
  includePositiveFeedback: boolean;
  onIncludePositiveFeedbackChange: (value: boolean) => void;
}

const InputView: React.FC<InputViewProps> = ({ 
  initialText, 
  onGetFeedback, 
  isLoading, 
  error, 
  maxInputLength,
  selectedPurpose,
  onPurposeChange,
  selectedTone,
  onToneChange,
  includePositiveFeedback,
  onIncludePositiveFeedbackChange
}) => {
  const [localInputText, setLocalInputText] = useState(initialText);

  useEffect(() => {
    setLocalInputText(initialText);
  }, [initialText]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalInputText(event.target.value);
  };

  const handleSubmit = () => {
    onGetFeedback(localInputText, selectedPurpose, selectedTone, includePositiveFeedback);
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white p-6 sm:p-8 shadow-2xl rounded-xl border border-gray-200">
        
        <div className="mb-6 space-y-4">
          <div>
            <label htmlFor="purpose-select" className="block text-sm font-medium text-gray-700 mb-1 font-patrick-hand text-lg">目的を選択</label>
            <select 
              id="purpose-select"
              value={selectedPurpose} 
              onChange={e => onPurposeChange(e.target.value as PurposeType)} 
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-base"
              aria-label="Select feedback purpose"
            >
              {PURPOSE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tone-select" className="block text-sm font-medium text-gray-700 mb-1 font-patrick-hand text-lg">トーンを選択</label>
            <select 
              id="tone-select"
              value={selectedTone} 
              onChange={e => onToneChange(e.target.value as ToneType)} 
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-base"
              aria-label="Select feedback tone"
            >
              {TONE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="include-positive-feedback-input" className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
              <input
                id="include-positive-feedback-input"
                type="checkbox"
                checked={includePositiveFeedback}
                onChange={(e) => onIncludePositiveFeedbackChange(e.target.checked)}
                className="h-4 w-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500 mr-2 cursor-pointer"
              />
              良い点のフィードバックも表示する
            </label>
          </div>
        </div>

        <label htmlFor="text-input-large" className="block font-patrick-hand text-2xl sm:text-3xl text-rose-700 mb-4 text-center">
          Enter Your Text for Analysis
        </label>
        <textarea
          id="text-input-large"
          value={localInputText}
          onChange={handleInputChange}
          placeholder="あなたの文章をここに入力してください..."
          maxLength={maxInputLength}
          rows={20} 
          className="w-full p-4 border border-gray-300 rounded-lg shadow-inner focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors text-lg leading-relaxed resize-y"
          aria-label="Large text input for feedback"
          aria-describedby="char-count-large"
        />
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
          <p id="char-count-large" className="text-sm text-gray-500 mb-2 sm:mb-0" aria-live="polite">
            {localInputText.length}/{maxInputLength} characters
          </p>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !localInputText.trim()}
            className="font-patrick-hand bg-rose-600 hover:bg-rose-700 text-white text-xl px-10 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center active:bg-rose-800 w-full sm:w-auto"
            aria-label="Get feedback on the entered text"
            aria-busy={isLoading}
          >
            {isLoading ? <LoadingIcon /> : 'Get Feedback'}
          </button>
        </div>
        {error && <ErrorDisplay message={error} />}
      </div>
       <p className="mt-8 text-center text-gray-600 font-patrick-hand text-lg">
        ✨ Let WriteWise RedPen give your words a polish! ✨
      </p>
    </div>
  );
};

export default InputView;
