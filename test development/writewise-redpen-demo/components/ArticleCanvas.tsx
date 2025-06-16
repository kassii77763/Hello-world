
import React, { useMemo, useState, useEffect, useRef } from 'react';
import type { FeedbackItem, AnnotationDetail } from '../types';
import HandwrittenAnnotation from './HandwrittenAnnotation';
import LoadingIcon from './LoadingIcon';
import RedUnderline from './RedUnderline'; // Import the new component

interface ArticleCanvasProps {
  text: string;
  feedbackItems: FeedbackItem[];
  onAnnotationClick: (feedbackId: string) => void;
  isLoading: boolean;
  selectedFeedbackId: string | null;
}

const ANNOTATION_WIDTH = 70; 
const ANNOTATION_HEIGHT_ESTIMATE = 60; 
const MIN_VERTICAL_GAP_BETWEEN_ANNOTATIONS = 5; 
const ANNOTATION_MARGIN_FROM_RIGHT_EDGE = 15; 
const ARROW_ELBOW_HORIZONTAL_SEGMENT_LENGTH = 25; 
const ARROW_TARGET_TEXT_OFFSET = 5; 

const DEFAULT_ARROW_COLOR = "rgba(225, 29, 72, 0.6)";
const SELECTED_ARROW_COLOR = "rgba(192, 38, 211, 0.75)";

const UNDERLINE_ANIMATION_DELAY_MS = 450; // Delay between each underline animation starting


const ArticleCanvas: React.FC<ArticleCanvasProps> = ({ text, feedbackItems, onAnnotationClick, isLoading, selectedFeedbackId }) => {
  const [processedAnnotations, setProcessedAnnotations] = useState<AnnotationDetail[]>([]);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const [animatedUnderlineIds, setAnimatedUnderlineIds] = useState<Set<string>>(new Set());
  const animationTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const sortedFeedback = useMemo(() => {
    if (!text || !feedbackItems || feedbackItems.length === 0) return [];
    
    // Create a temporary map to store first occurrence of each target_text
    const firstOccurrenceMap = new Map<string, number>();
    text.split('').forEach((_, i) => {
        feedbackItems.forEach(item => {
            if (item.target_text && text.substring(i).startsWith(item.target_text)) {
                if (!firstOccurrenceMap.has(item.id)) { // Store first occurrence based on ID
                    firstOccurrenceMap.set(item.id, i);
                }
            }
        });
    });

    return [...feedbackItems].sort((a, b) => {
      const indexA = firstOccurrenceMap.get(a.id) ?? -1;
      const indexB = firstOccurrenceMap.get(b.id) ?? -1;

      if (indexA === -1 && indexB === -1) return 0; // Both not found or invalid
      if (indexA === -1) return 1; // a not found, b is, so b comes first
      if (indexB === -1) return -1; // b not found, a is, so a comes first
      if (indexA !== indexB) return indexA - indexB; // Sort by start index
      
      // If start indices are the same, sort by length of target_text (longer first)
      // This helps if one target is a substring of another starting at the same point.
      return (b.target_text?.length || 0) - (a.target_text?.length || 0);
    });
  }, [text, feedbackItems]);

  useEffect(() => {
    animationTimeoutsRef.current.forEach(clearTimeout);
    animationTimeoutsRef.current = [];
    setAnimatedUnderlineIds(new Set()); 

    if (sortedFeedback.length > 0 && !isLoading) {
      // console.log("Scheduling animations for:", sortedFeedback.map(f => f.id));
      sortedFeedback.forEach((item, index) => {
        const timeoutId = setTimeout(() => {
          // console.log(`Animating: ${item.id} at index ${index}`);
          setAnimatedUnderlineIds(prev => new Set(prev).add(item.id));
        }, index * UNDERLINE_ANIMATION_DELAY_MS);
        animationTimeoutsRef.current.push(timeoutId);
      });
    }

    return () => {
      animationTimeoutsRef.current.forEach(clearTimeout);
    };
  }, [sortedFeedback, isLoading]); 

  const renderedTextParts = useMemo(() => {
    if (!text) {
      return [<React.Fragment key="empty-text">{''}</React.Fragment>];
    }
    if (sortedFeedback.length === 0) {
      return [<React.Fragment key="full-text-no-feedback">{text}</React.Fragment>];
    }

    let lastIndex = 0;
    const parts: React.ReactNode[] = [];
    
    // Create a map for quick lookup of original start indices, using the more robust sorting logic
    const occurrenceMap = new Map<string, number>();
     if (text && sortedFeedback.length > 0) {
        let tempText = text;
        let offset = 0;
        const tempSortedFeedback = [...sortedFeedback].sort((a,b) => (a.target_text?.length || 0) - (b.target_text?.length || 0)); // Shorter first for reliable replacement

        tempSortedFeedback.forEach(item => {
            const itemIndex = tempText.indexOf(item.target_text);
            if (itemIndex !== -1) {
                occurrenceMap.set(item.id, itemIndex + offset);
                // "Consume" the found part to avoid re-matching for overlapping shorter strings
                const placeholder = "_".repeat(item.target_text.length);
                tempText = tempText.substring(0, itemIndex) + placeholder + tempText.substring(itemIndex + item.target_text.length);
                // offset logic might need refinement if deletions change string length for subsequent searches.
                // However, for pure indexing in original string, this is fine.
            }
        });
    }


    // Use the original sortedFeedback for rendering order
    sortedFeedback.forEach((item) => {
      const startIndex = text.indexOf(item.target_text, lastIndex); // Basic sequential search for rendering

      if (startIndex !== -1 && startIndex >= lastIndex) {
        if (startIndex > lastIndex) {
          parts.push(<React.Fragment key={`text-${lastIndex}-${startIndex}`}>{text.substring(lastIndex, startIndex)}</React.Fragment>);
        }
        parts.push(
          <RedUnderline
            key={item.id}
            feedbackId={item.id}
            text={item.target_text}
            isSelected={selectedFeedbackId === item.id}
            onClick={onAnnotationClick}
            startAnimation={animatedUnderlineIds.has(item.id)}
          />
        );
        lastIndex = startIndex + item.target_text.length;
      } else {
        // Fallback: If sequential search fails (e.g. due to legitimate overlaps not handled by basic sort),
        // try to place it using the pre-calculated occurrenceMap if that item was found.
        // This part is complex due to potential overlaps and needs careful handling.
        // For simplicity, if sequential processing fails, the item might not be rendered as a RedUnderline here.
        // The robust sorting in `sortedFeedback` primarily helps animation order and annotation positioning.
      }
    });

    if (lastIndex < text.length) {
      parts.push(<React.Fragment key={`text-${lastIndex}-end`}>{text.substring(lastIndex)}</React.Fragment>);
    }
    
    if (parts.length === 0 && text && sortedFeedback.length > 0) {
        // This case indicates all target_text were unrenderable by the above logic.
        // Default to showing the full text.
        // console.warn("All feedback items were unrenderable. Displaying full text without highlights.");
        return [<React.Fragment key="full-text-render-fallback">{text}</React.Fragment>];
    }


    return parts;
  }, [text, sortedFeedback, onAnnotationClick, selectedFeedbackId, animatedUnderlineIds]);


  useEffect(() => {
    const contentAreaNode = contentAreaRef.current;
    if (!contentAreaNode || sortedFeedback.length === 0 || !text) {
      setProcessedAnnotations([]);
      return;
    }

    const initialAnnotationData = sortedFeedback.map(item => {
      const spanElement = document.getElementById(`feedback-target-${item.id}`);
      if (!spanElement || !contentAreaNode.contains(spanElement)) {
        return null;
      }
      const spanRect = spanElement.getBoundingClientRect(); 
      const contentAreaRect = contentAreaNode.getBoundingClientRect(); 

      const spanTopRelativeToContentArea = spanRect.top - contentAreaRect.top + contentAreaNode.scrollTop;
      const spanLeftRelativeToContentArea = spanRect.left - contentAreaRect.left + contentAreaNode.scrollLeft;
      
      const idealAnnotationTop = Math.max(0, spanTopRelativeToContentArea + (spanRect.height / 2) - (ANNOTATION_HEIGHT_ESTIMATE / 2));
      
      return {
        item,
        idealAnnotationTop,
        spanTop: spanTopRelativeToContentArea,
        spanLeft: spanLeftRelativeToContentArea,
        spanWidth: spanRect.width,
        spanHeight: spanRect.height,
      };
    }).filter(Boolean) as ({ item: FeedbackItem; idealAnnotationTop: number; spanTop: number; spanLeft: number; spanWidth: number; spanHeight: number; })[];

    initialAnnotationData.sort((a, b) => a.idealAnnotationTop - b.idealAnnotationTop);


    const finalAnnotations: AnnotationDetail[] = [];
    let lastAnnotationBottom = -MIN_VERTICAL_GAP_BETWEEN_ANNOTATIONS; 

    initialAnnotationData.forEach(data => {
      const { item, spanTop, spanLeft, spanWidth, spanHeight, idealAnnotationTop } = data;

      const actualAnnotationTop = Math.max(
        idealAnnotationTop,
        lastAnnotationBottom + MIN_VERTICAL_GAP_BETWEEN_ANNOTATIONS
      );
      
      const scrollableContentClientWidth = contentAreaNode.clientWidth;
      const annotationLeft = scrollableContentClientWidth - ANNOTATION_WIDTH - ANNOTATION_MARGIN_FROM_RIGHT_EDGE;

      const arrowStartX = annotationLeft;
      const arrowStartY = actualAnnotationTop + (ANNOTATION_HEIGHT_ESTIMATE / 2);

      const arrowEndX = spanLeft + spanWidth + ARROW_TARGET_TEXT_OFFSET;
      const arrowEndY = spanTop + (spanHeight / 2);

      finalAnnotations.push({
        id: item.id,
        item: item,
        position: {
          top: actualAnnotationTop,
          left: annotationLeft,
        },
        arrow: { 
          startX: arrowStartX,
          startY: arrowStartY,
          elbowX: arrowStartX - ARROW_ELBOW_HORIZONTAL_SEGMENT_LENGTH,
          targetX: arrowEndX,
          targetY: arrowEndY,
        },
      });
      lastAnnotationBottom = actualAnnotationTop + ANNOTATION_HEIGHT_ESTIMATE;
    });

    setProcessedAnnotations(finalAnnotations);
  }, [sortedFeedback, text, selectedFeedbackId]); 

  return (
    <div className="bg-white p-6 shadow-xl rounded-lg h-full overflow-auto relative border border-gray-200">
      <div 
        ref={contentAreaRef} 
        className="article-canvas-content-area whitespace-pre-wrap leading-relaxed text-lg text-gray-800 pl-6 pr-32 py-12 relative"
      >
        {renderedTextParts.map((part, index) => (
            <React.Fragment key={typeof part === 'string' ? `string-${index}` : (part as React.ReactElement).key || `node-${index}`}>
                {part}
            </React.Fragment>
        ))}


        {processedAnnotations.map((annotation) => (
          <HandwrittenAnnotation 
            key={annotation.id} 
            annotation={annotation} 
            onClick={() => onAnnotationClick(annotation.item.id)}
          />
        ))}

        <svg 
            aria-hidden="true"
            style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: contentAreaRef.current?.scrollWidth ? `${contentAreaRef.current.scrollWidth}px` : '100%', 
                height: contentAreaRef.current?.scrollHeight ? `${contentAreaRef.current.scrollHeight}px` : '100%',
                pointerEvents: 'none', 
                zIndex: 5 
            }}
        >
          <defs>
            <marker 
                id="arrowhead" 
                markerWidth="10" 
                markerHeight="7" 
                refX="8"
                refY="3.5" 
                orient="auto"
            >
              <polygon points="0 0, 9 3.5, 0 7" style={{ fill: DEFAULT_ARROW_COLOR }} />
            </marker>
            <marker 
                id="arrowhead-selected" 
                markerWidth="12"
                markerHeight="8.4" 
                refX="9.6"
                refY="4.2" 
                orient="auto"
            >
              <polygon points="0 0, 10.8 4.2, 0 8.4" style={{ fill: SELECTED_ARROW_COLOR }} /> 
            </marker>
          </defs>
          {processedAnnotations.map(anno => {
            if (!anno.arrow) return null;
            const { startX, startY, elbowX, targetX, targetY } = anno.arrow;
            const pathData = `M ${startX},${startY} L ${elbowX},${startY} L ${elbowX},${targetY} L ${targetX},${targetY}`;
            
            return (
              <path
                key={`arrow-${anno.id}`}
                d={pathData}
                stroke={selectedFeedbackId === anno.id ? SELECTED_ARROW_COLOR : DEFAULT_ARROW_COLOR}
                strokeWidth={selectedFeedbackId === anno.id ? "3" : "2"}
                markerEnd={selectedFeedbackId === anno.id ? "url(#arrowhead-selected)" : "url(#arrowhead)"}
                fill="none"
              />
            );
          })}
        </svg>
      </div>
      {isLoading && (
        <div className="absolute inset-0 bg-white/75 backdrop-blur-sm flex items-center justify-center z-30 rounded-lg">
           <LoadingIcon />
        </div>
      )}
    </div>
  );
};

export default ArticleCanvas;