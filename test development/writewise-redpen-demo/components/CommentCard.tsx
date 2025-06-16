
import React from 'react';
import type { FeedbackItem } from '../types';

interface CommentCardProps {
  item: FeedbackItem;
  isSelected?: boolean;
  onClick?: () => void;
}

const CommentCard: React.FC<CommentCardProps> = ({ item, isSelected, onClick }) => {
  return (
    <div
      id={`comment-card-${item.id}`} // Added ID for scrolling
      className={`p-4 mb-4 border rounded-lg shadow-sm transition-all duration-200 ease-in-out cursor-pointer ${
        isSelected 
          ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500' 
          : 'bg-white border-gray-200 hover:shadow-md hover:border-rose-300'
      }`}
      onClick={onClick}
      role="listitem"
      aria-selected={isSelected}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
    >
      <div className="mb-2">
        <span className="font-patrick-hand text-sm text-rose-600 px-2 py-0.5 bg-rose-100 rounded-full border border-rose-200">
          指摘箇所:
        </span>
        <p className="mt-1 text-gray-700 italic">"{item.target_text}"</p>
      </div>
      
      <div className="mb-2">
        <span className="font-patrick-hand text-sm text-rose-600 px-2 py-0.5 bg-rose-100 rounded-full border border-rose-200">
          コメント:
        </span>
        <p className="mt-1 text-gray-800">{item.comment}</p>
      </div>

      {item.suggestion && (
        <div>
          <span className="font-patrick-hand text-sm text-green-600 px-2 py-0.5 bg-green-100 rounded-full border border-green-200">
            修正案:
          </span>
          <p className="mt-1 text-gray-800 font-semibold">{item.suggestion}</p>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        <span className="font-semibold">Type:</span> {item.type} | <span className="font-semibold">Tags:</span> {item.tag.join(', ')}
      </div>
    </div>
  );
};

export default CommentCard;
