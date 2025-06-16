
import React from 'react';
import type { FeedbackItem, PurposeType, ToneType } from '../types';
import ArticleCanvas from '../components/ArticleCanvas';
import CommentSidebar from '../components/CommentSidebar';
import FeedbackSettingsControls from '../components/FeedbackSettingsControls';
import ErrorDisplay from '../components/ErrorDisplay';


interface FeedbackViewProps {
  submittedText: string;
  feedbackItems: FeedbackItem[];
  isLoading: boolean;
  selectedFeedbackId: string | null;
  onAnnotationClick: (feedbackId: string) => void;
  onCommentSelect: (feedbackId: string | null) => void;
  selectedPurpose: PurposeType;
  onPurposeChange: (purpose: PurposeType) => void;
  selectedTone: ToneType;
  onToneChange: (tone: ToneType) => void;
  includePositiveFeedback: boolean;
  onIncludePositiveFeedbackChange: (value: boolean) => void;
  error: string | null;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({
  submittedText,
  feedbackItems,
  isLoading,
  selectedFeedbackId,
  onAnnotationClick,
  onCommentSelect,
  selectedPurpose,
  onPurposeChange,
  selectedTone,
  onToneChange,
  includePositiveFeedback,
  onIncludePositiveFeedbackChange,
  error
}) => {
  return (
    <div className="flex-grow flex flex-col md:flex-row gap-6 h-full w-full px-4 sm:px-6 lg:px-8">
      {/* Left Column for ArticleCanvas */}
      <div className="md:w-3/5 lg:w-2/3 flex flex-col gap-6 h-full">
        {/* ArticleCanvas Wrapper: Make it a flex container to ensure ArticleCanvas (h-full) fills it properly */}
        <div className="flex flex-col flex-grow min-h-[400px]"> 
          <ArticleCanvas
            text={submittedText || "Enter text and click 'Get Feedback' to see annotations."}
            feedbackItems={feedbackItems}
            onAnnotationClick={onAnnotationClick}
            isLoading={isLoading}
            selectedFeedbackId={selectedFeedbackId}
          />
        </div>
      </div>

      {/* Right Column for Settings and CommentSidebar */}
      <div className="md:w-2/5 lg:w-1/3 flex-shrink-0 h-full flex flex-col">
        {/* Container for settings and sticky sidebar content */}
        <div className="h-full md:sticky md:top-24 flex flex-col gap-4 md:max-h-[calc(100vh-theme(spacing.24)-theme(spacing.12))]">
            <FeedbackSettingsControls
                selectedPurpose={selectedPurpose}
                onPurposeChange={onPurposeChange}
                selectedTone={selectedTone}
                onToneChange={onToneChange}
                includePositiveFeedback={includePositiveFeedback}
                onIncludePositiveFeedbackChange={onIncludePositiveFeedbackChange}
                isLoading={isLoading}
            />
             {error && (
              <div className="px-1"> {/* Consistent padding with sidebar items */}
                <ErrorDisplay message={error} />
              </div>
            )}
            {/* CommentSidebar needs to grow and scroll within the remaining space */}
            <div className="flex flex-col flex-grow"> 
                 <CommentSidebar
                    feedbackItems={feedbackItems}
                    selectedFeedbackId={selectedFeedbackId}
                    onCommentSelect={onCommentSelect}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackView;
