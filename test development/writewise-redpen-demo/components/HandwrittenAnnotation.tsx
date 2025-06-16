
import React from 'react';
import type { AnnotationDetail } from '../types';

interface HandwrittenAnnotationProps {
  annotation: AnnotationDetail;
  onClick?: () => void;
}

const HandwrittenAnnotation: React.FC<HandwrittenAnnotationProps> = ({ annotation, onClick }) => {
  const displayComment = annotation.item.comment.length > 28
    ? annotation.item.comment.substring(0, 25) + "..."
    : annotation.item.comment;

  return (
    <div
      className="font-patrick-hand text-rose-700 text-xs absolute bg-white/85 backdrop-blur-sm p-2 rounded-md shadow-lg border border-rose-300 cursor-pointer hover:bg-rose-50 hover:shadow-xl transition-all duration-150 ease-in-out"
      style={{
        top: `${annotation.position.top}px`,
        left: `${annotation.position.left}px`,
        zIndex: 10, // Ensure annotations are above arrows (SVG zIndex behavior can be complex)
        width: '70px', // Fixed width for consistent stacking
        minHeight: '50px', // Minimum height for consistent stacking, adjust as needed
        lineHeight: '1.35', // Slightly adjusted for text fit
        whiteSpace: 'normal',
        display: 'flex', // To help with vertical centering if desired, or content alignment
        flexDirection: 'column',
        justifyContent: 'center', // Vertically center text if box is taller
      }}
      onClick={onClick}
      title={annotation.item.comment} // Full comment on hover
      aria-label={`Annotation: ${annotation.item.comment}`}
    >
      <span className="block">{displayComment}</span>
    </div>
  );
};

export default HandwrittenAnnotation;
