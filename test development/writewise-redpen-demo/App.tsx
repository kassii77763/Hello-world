
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { FeedbackItem, CurrentViewType } from './types';
import { DEFAULT_INPUT_TEXT, MAX_INPUT_LENGTH, SAMPLE_FEEDBACK_ITEMS, DEFAULT_PURPOSE, DEFAULT_TONE, DEFAULT_INCLUDE_POSITIVE_FEEDBACK, PurposeType, ToneType } from './constants';
import { getAiFeedback } from './services/geminiService';
import InputView from './views/InputView';
import FeedbackView from './views/FeedbackView';
import AiCorrectedTextView from './views/AiCorrectedTextView';


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<CurrentViewType>('input');
  const [inputText, setInputText] = useState<string>(DEFAULT_INPUT_TEXT);
  const [submittedText, setSubmittedText] = useState<string>('');
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null);

  const [selectedPurpose, setSelectedPurpose] = useState<PurposeType>(DEFAULT_PURPOSE);
  const [selectedTone, setSelectedTone] = useState<ToneType>(DEFAULT_TONE);
  const [includePositiveFeedback, setIncludePositiveFeedback] = useState<boolean>(DEFAULT_INCLUDE_POSITIVE_FEEDBACK);

  // State to track settings used for the current feedbackItems
  const [lastFetchedPurpose, setLastFetchedPurpose] = useState<PurposeType | null>(null);
  const [lastFetchedTone, setLastFetchedTone] = useState<ToneType | null>(null);
  const [lastFetchedIncludePositiveFeedback, setLastFetchedIncludePositiveFeedback] = useState<boolean | null>(null);

  // Initial load: if no API key, load sample data and go to feedback view
  useEffect(() => {
    if (!process.env.API_KEY && currentView === 'input' && !submittedText && !isLoading && feedbackItems.length === 0) {
      console.log("No API Key found, loading sample feedback.");
      setInputText(DEFAULT_INPUT_TEXT);
      setSubmittedText(DEFAULT_INPUT_TEXT);
      setFeedbackItems(SAMPLE_FEEDBACK_ITEMS);
      setSelectedPurpose(DEFAULT_PURPOSE); 
      setSelectedTone(DEFAULT_TONE);
      setIncludePositiveFeedback(DEFAULT_INCLUDE_POSITIVE_FEEDBACK);
      setLastFetchedPurpose(DEFAULT_PURPOSE); 
      setLastFetchedTone(DEFAULT_TONE);
      setLastFetchedIncludePositiveFeedback(DEFAULT_INCLUDE_POSITIVE_FEEDBACK);
      setCurrentView('feedback');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const handleGetFeedback = useCallback(async (textToSubmit: string, purpose: PurposeType, tone: ToneType, includePositive: boolean) => {
    if (!textToSubmit.trim()) {
      setError("Please enter some text to get feedback.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setFeedbackItems([]);
    setSelectedFeedbackId(null);

    try {
      const items = await getAiFeedback(textToSubmit, purpose, tone, includePositive);
      setFeedbackItems(items);
      setSubmittedText(textToSubmit);
      setSelectedPurpose(purpose); 
      setSelectedTone(tone);
      setIncludePositiveFeedback(includePositive);
      setLastFetchedPurpose(purpose); 
      setLastFetchedTone(tone);
      setLastFetchedIncludePositiveFeedback(includePositive);
      setCurrentView('feedback');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching feedback.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to re-fetch feedback when settings change in FeedbackView
  useEffect(() => {
    if (
      currentView === 'feedback' && 
      submittedText &&
      !isLoading &&
      (selectedPurpose !== lastFetchedPurpose || 
       selectedTone !== lastFetchedTone || 
       includePositiveFeedback !== lastFetchedIncludePositiveFeedback)
    ) {
        if (lastFetchedPurpose === null || lastFetchedTone === null || lastFetchedIncludePositiveFeedback === null) {
            // Avoid re-fetching if initial settings haven't been established for the current feedback
            return;
        }

        console.log("Settings changed, re-fetching feedback with new settings:", selectedPurpose, selectedTone, includePositiveFeedback);
        setIsLoading(true);
        setError(null);
        
        getAiFeedback(submittedText, selectedPurpose, selectedTone, includePositiveFeedback)
          .then(items => {
            setFeedbackItems(items);
            setSelectedFeedbackId(null); 
            setLastFetchedPurpose(selectedPurpose); 
            setLastFetchedTone(selectedTone);
            setLastFetchedIncludePositiveFeedback(includePositiveFeedback);
          })
          .catch(err => {
            if (err instanceof Error) {
              setError(err.message);
            } else {
              setError("An unknown error occurred while re-fetching feedback with new settings.");
            }
          })
          .finally(() => {
            setIsLoading(false);
          });
    }
  }, [selectedPurpose, selectedTone, includePositiveFeedback, currentView, submittedText, isLoading, lastFetchedPurpose, lastFetchedTone, lastFetchedIncludePositiveFeedback, getAiFeedback]);


  const handleTabChange = (view: CurrentViewType) => {
    if (isLoading) return; 
    if ((view === 'feedback' || view === 'aiCorrectedText') && !submittedText) return; 
    setCurrentView(view);
    setError(null); 
  };

  const handleAnnotationClick = (feedbackId: string) => {
    setSelectedFeedbackId(feedbackId);
    const commentCardContainer = document.querySelector('.comment-sidebar-content'); 
    const commentCard = document.getElementById(`comment-card-${feedbackId}`);
    
    if (commentCard && commentCardContainer) {
        const cardRect = commentCard.getBoundingClientRect();
        const containerRect = commentCardContainer.getBoundingClientRect();
        if (cardRect.top < containerRect.top || cardRect.bottom > containerRect.bottom) {
             commentCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    const targetSpan = document.getElementById(`feedback-target-${feedbackId}`);
    if (targetSpan) {
        const canvasContentArea = targetSpan.closest('.article-canvas-content-area');
        if (canvasContentArea) {
            const spanRect = targetSpan.getBoundingClientRect();
            const canvasRect = canvasContentArea.getBoundingClientRect();
            if (spanRect.top < canvasRect.top || spanRect.bottom > canvasRect.bottom || spanRect.left < canvasRect.left || spanRect.right > canvasRect.right) {
                 targetSpan.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            }
        } else { 
            targetSpan.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }
    }
  };
  
  const handleCommentSelect = (feedbackId: string | null) => {
    setSelectedFeedbackId(feedbackId);
    if (feedbackId) {
        const targetSpan = document.getElementById(`feedback-target-${feedbackId}`);
        if (targetSpan) {
            targetSpan.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }
    }
  };

  const baseTabClass = "font-patrick-hand text-lg px-5 py-2 rounded-t-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500";
  const activeTabClass = "bg-rose-600 text-white shadow-md";
  const inactiveTabClass = "bg-white/60 text-rose-700 hover:bg-rose-100 hover:text-rose-800";
  const disabledTabClass = "opacity-50 cursor-not-allowed";


  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 text-gray-800 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-patrick-hand text-3xl text-rose-600">
            WriteWise <span className="text-amber-600">RedPen</span>
          </h1>
          <div className="flex space-x-1 border-b-2 border-rose-200">
            <button
              onClick={() => handleTabChange('input')}
              disabled={isLoading}
              className={`${baseTabClass} ${currentView === 'input' ? activeTabClass : inactiveTabClass} ${isLoading ? disabledTabClass : ''}`}
              aria-current={currentView === 'input' ? 'page' : undefined}
            >
              テキスト入力
            </button>
            <button
              onClick={() => handleTabChange('feedback')}
              disabled={isLoading || !submittedText}
              className={`${baseTabClass} ${currentView === 'feedback' ? activeTabClass : inactiveTabClass} ${(isLoading || !submittedText) ? disabledTabClass : ''}`}
              aria-current={currentView === 'feedback' ? 'page' : undefined}
            >
              フィードバック結果
            </button>
            <button
              onClick={() => handleTabChange('aiCorrectedText')}
              disabled={isLoading || !submittedText}
              className={`${baseTabClass} ${currentView === 'aiCorrectedText' ? activeTabClass : inactiveTabClass} ${(isLoading || !submittedText) ? disabledTabClass : ''}`}
              aria-current={currentView === 'aiCorrectedText' ? 'page' : undefined}
            >
              AI修正案
            </button>
          </div>
        </div>
      </header>

      <main className="w-full py-6 flex-grow flex flex-col">
        {currentView === 'input' && (
          <InputView
            initialText={inputText}
            onGetFeedback={handleGetFeedback}
            isLoading={isLoading}
            error={error}
            maxInputLength={MAX_INPUT_LENGTH}
            selectedPurpose={selectedPurpose}
            onPurposeChange={setSelectedPurpose}
            selectedTone={selectedTone}
            onToneChange={setSelectedTone}
            includePositiveFeedback={includePositiveFeedback}
            onIncludePositiveFeedbackChange={setIncludePositiveFeedback}
          />
        )}
        {currentView === 'feedback' && submittedText && (
          <FeedbackView
            submittedText={submittedText}
            feedbackItems={feedbackItems}
            isLoading={isLoading}
            selectedFeedbackId={selectedFeedbackId}
            onAnnotationClick={handleAnnotationClick}
            onCommentSelect={handleCommentSelect}
            selectedPurpose={selectedPurpose}
            onPurposeChange={setSelectedPurpose}
            selectedTone={selectedTone}
            onToneChange={setSelectedTone}
            includePositiveFeedback={includePositiveFeedback}
            onIncludePositiveFeedbackChange={setIncludePositiveFeedback}
            error={error}
          />
        )}
        {currentView === 'aiCorrectedText' && submittedText && (
          <AiCorrectedTextView
            submittedText={submittedText}
            feedbackItems={feedbackItems}
            isLoading={isLoading}
            error={error}
          />
        )}
      </main>

      <footer className="text-center py-4 text-sm text-gray-500 border-t border-gray-200 bg-white/50 mt-auto">
        WriteWise RedPen Demo &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
