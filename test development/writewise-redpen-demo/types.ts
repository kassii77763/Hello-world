
export interface FeedbackItem {
  id: string;
  target_text: string;
  comment: string;
  suggestion: string;
  type: string; // e.g., 'suggestion', 'grammar', 'clarity'
  tag: string[];
}

export interface AnnotationDetail {
  id: string;
  item: FeedbackItem; // Full feedback item for context
  position: { // For the annotation box itself
    top: number;
    left: number;
  };
  arrow: { // Key points for drawing an elbow connector
    startX: number; // Annotation side X
    startY: number; // Annotation side Y (vertical mid-point)
    elbowX: number; // X-coordinate of the point after the first horizontal segment from annotation
    targetX: number; // Target text side X (right edge of span + offset)
    targetY: number; // Target text side Y (vertical mid-point of span)
  } | null;
}

// Re-exporting these from constants.ts for convenience in other files if needed
// Or ensure they are directly imported from constants.ts where used.
// For now, components should import directly from constants.ts
export type { PurposeType, ToneType } from './constants';

export type CurrentViewType = 'input' | 'feedback' | 'aiCorrectedText';
