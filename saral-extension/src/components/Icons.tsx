import {
  Mic,
  Square,
  Volume2,
  SkipForward,
  X,
  Check,
  ChevronDown,
  Info,
  TriangleAlert,
  CircleAlert,
  CircleCheck,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

export {
  Mic as MicIcon,
  Volume2 as SpeakerIcon,
  SkipForward as SkipIcon,
  X as CloseIcon,
  Check as CheckIcon,
  ChevronDown as ChevronDownIcon,
  Info as InfoIcon,
  TriangleAlert as AlertIcon,
  CircleAlert as ErrorIcon,
  CircleCheck as SuccessIcon,
};

// Lucide's Square is an outline, so fill it for a solid "stop" glyph.
export const StopIcon = (props: LucideProps) => (
  <Square fill="currentColor" strokeWidth={0} {...props} />
);