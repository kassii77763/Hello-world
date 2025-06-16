
import React, { useState, useEffect, useRef } from 'react';

interface RedUnderlineProps {
  feedbackId: string;
  text: string;
  isSelected: boolean;
  onClick: (feedbackId: string) => void;
  startAnimation: boolean;
}

const RedUnderline: React.FC<RedUnderlineProps> = ({ feedbackId, text, isSelected, onClick, startAnimation }) => {
  const [animationClass, setAnimationClass] = useState('');
  
  useEffect(() => {
    if (startAnimation) {
      setAnimationClass('animate-draw-redline');
    } else {
      // If you want the animation to reset and replay if startAnimation becomes false then true again:
      setAnimationClass(''); 
    }
  }, [startAnimation]);

  return (
    <span
      id={`feedback-target-${feedbackId}`} // Used by ArticleCanvas for positioning annotations and by App.tsx for scrolling
      className={`relative group cursor-pointer inline-block ${isSelected ? 'ring-2 ring-rose-500 ring-offset-2 rounded-sm' : ''}`}
      onClick={() => onClick(feedbackId)}
      style={{ paddingBottom: '5px' }} // Provides space for the underline below the text
    >
      <span className="z-10 relative feedback-text-segment"> {/* Apply common styling for the text part */}
        {text}
      </span>
      <svg
        className="absolute left-0 bottom-0 w-full h-2.5 z-0" // h-2.5 is 10px, adjust if needed
        viewBox="0 0 100 10" // Defines the coordinate system for the path
        preserveAspectRatio="none" // Stretches the SVG to fill the span's width
        aria-hidden="true"
      >
        <path
          d="M0,5 C10,10 20,0 30,5 C40,10 50,0 60,5 C70,10 80,0 90,5 C95,8 100,2 100,5" // The wave path
          strokeWidth="1.5"
          fill="none"
          className={`red-underline-path-initial stroke-rose-500 ${animationClass}`}
        />
      </svg>
    </span>
  );
};

export default RedUnderline;
