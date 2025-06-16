
import React from 'react';
import { PURPOSE_OPTIONS, TONE_OPTIONS, PurposeType, ToneType } from '../constants';

interface FeedbackSettingsControlsProps {
  selectedPurpose: PurposeType;
  onPurposeChange: (purpose: PurposeType) => void;
  selectedTone: ToneType;
  onToneChange: (tone: ToneType) => void;
  includePositiveFeedback: boolean;
  onIncludePositiveFeedbackChange: (value: boolean) => void;
  isLoading: boolean;
}

const FeedbackSettingsControls: React.FC<FeedbackSettingsControlsProps> = ({
  selectedPurpose,
  onPurposeChange,
  selectedTone,
  onToneChange,
  includePositiveFeedback,
  onIncludePositiveFeedbackChange,
  isLoading,
}) => {
  return (
    <div className="p-4 bg-white shadow-lg rounded-lg border border-gray-200 space-y-4 flex-shrink-0">
      <div>
        <label htmlFor="feedback-purpose-select" className="block text-sm font-medium text-gray-700 mb-1 font-patrick-hand text-base">
          Feedback Purpose
        </label>
        <select
          id="feedback-purpose-select"
          value={selectedPurpose}
          onChange={(e) => onPurposeChange(e.target.value as PurposeType)}
          disabled={isLoading}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm disabled:opacity-70 disabled:bg-gray-100"
          aria-label="Select feedback purpose"
        >
          {PURPOSE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="feedback-tone-select" className="block text-sm font-medium text-gray-700 mb-1 font-patrick-hand text-base">
          Feedback Tone
        </label>
        <select
          id="feedback-tone-select"
          value={selectedTone}
          onChange={(e) => onToneChange(e.target.value as ToneType)}
          disabled={isLoading}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm disabled:opacity-70 disabled:bg-gray-100"
          aria-label="Select feedback tone"
        >
          {TONE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="include-positive-feedback-settings" className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
          <input
            id="include-positive-feedback-settings"
            type="checkbox"
            checked={includePositiveFeedback}
            onChange={(e) => onIncludePositiveFeedbackChange(e.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500 mr-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          />
          良い点のフィードバックも表示する
        </label>
      </div>
    </div>
  );
};

export default FeedbackSettingsControls;
