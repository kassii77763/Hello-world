import React from 'react';
import type { FeedbackItem } from '../types';
import CommentCard from './CommentCard';

interface CommentSidebarProps {
  feedbackItems: FeedbackItem[];
  selectedFeedbackId: string | null;
  onCommentSelect: (feedbackId: string | null) => void;
}

const CommentSidebar: React.FC<CommentSidebarProps> = ({ feedbackItems, selectedFeedbackId, onCommentSelect }) => {
  if (feedbackItems.length === 0 && !selectedFeedbackId) { // Ensure placeholder shows if items are empty initially
    return (
      <div className="p-6 bg-white shadow-lg rounded-lg h-full flex flex-col items-center justify-center text-gray-500 flex-grow border border-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="font-patrick-hand text-xl">フィードバック待ち...</p>
        <p className="text-sm mt-1">テキストを入力して「Get Feedback」を押してください。</p>
        <p className="text-xs mt-1">(または、設定を変更すると再分析されます)</p>
      </div>
    );
  }
  
  if (feedbackItems.length === 0 && selectedFeedbackId === null) {
     return (
      <div className="p-6 bg-white shadow-lg rounded-lg h-full flex flex-col items-center justify-center text-gray-500 flex-grow border border-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
        <p className="font-patrick-hand text-lg text-gray-600">No feedback items found.</p>
        <p className="text-xs mt-1 text-gray-400">Try different settings or text.</p>
      </div>
    );
  }


  return (
    // Removed h-full, relying on flex-grow in parent flex-col context
    <div className="p-1 bg-white shadow-lg rounded-lg flex flex-col overflow-hidden flex-grow border border-gray-200"> 
       <h3 className="font-patrick-hand text-2xl text-rose-700 p-4 sticky top-0 bg-white/90 backdrop-blur-sm z-10 border-b border-gray-200 flex-shrink-0">
        Red Pen Comments
      </h3>
      <div className="comment-sidebar-content p-4 overflow-y-auto flex-grow">
        {feedbackItems.map((item) => (
          <CommentCard 
            key={item.id} 
            item={item}
            isSelected={selectedFeedbackId === item.id}
            onClick={() => onCommentSelect(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default CommentSidebar;