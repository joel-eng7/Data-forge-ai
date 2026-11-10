/**
 * GESTURA AI — Gesture Definitions & Specifications
 * Full catalogue of 7 computer control gestures with actions, 3D poses, and instructions.
 * Adheres strictly to the Premium Pink & White 3D Design Direction.
 */

export interface GestureDefinition {
  id: string;
  name: string;
  action: string;
  category: 'cursor' | 'click' | 'navigation' | 'safety' | 'system';
  description: string;
  howToPerform: string;
  iconName: string;
  emoji: string;
  color: string;
  accentBg: string;
  badge: string;
  thresholdTips: string;
  // 3D hand finger rotations in degrees for Three.js hand simulation
  poseRotations: {
    thumb: number[];
    index: number[];
    middle: number[];
    ring: number[];
    pinky: number[];
  };
}

export const GESTURE_DEFINITIONS: Record<string, GestureDefinition> = {
  OPEN_PALM: {
    id: 'OPEN_PALM',
    name: 'Open Palm',
    action: 'Activate / Pause Cursor Mode',
    category: 'cursor',
    description: 'Extends all five fingers in a relaxed, open hand position to toggle or steady spatial tracking.',
    howToPerform: 'Spread all five fingers comfortably facing the camera. Hold steady for 0.2s to calibrate.',
    iconName: 'Hand',
    emoji: '🖐️',
    color: '#FFD633',
    accentBg: 'bg-gestura-goldLight/80 border-gestura-yellow/50 text-gestura-text',
    badge: 'Tracking Ready',
    thresholdTips: 'Requires all 5 fingers extended. Keeps your cursor steady without unintended drifts.',
    poseRotations: {
      thumb: [0, 0, 0],
      index: [0, 0, 0],
      middle: [0, 0, 0],
      ring: [0, 0, 0],
      pinky: [0, 0, 0]
    }
  },

  INDEX_POINTING: {
    id: 'INDEX_POINTING',
    name: 'Index Finger Pointing',
    action: 'Move Mouse Cursor',
    category: 'cursor',
    description: 'Directly maps your index fingertip coordinates to desktop screen coordinates with fluid EMA smoothing.',
    howToPerform: 'Extend only your index finger while keeping middle, ring, and pinky curled into your palm.',
    iconName: 'MousePointer',
    emoji: '👉',
    color: '#F5C21B',
    accentBg: 'bg-gestura-yellow/25 border-gestura-yellow text-gestura-text font-semibold',
    badge: 'Primary Cursor',
    thresholdTips: 'Sub-millimeter jitter suppression and configurable sensitivity ensure pinpoint precision.',
    poseRotations: {
      thumb: [60, 20, 10],
      index: [0, 0, 0],
      middle: [85, 0, 0],
      ring: [85, 0, 0],
      pinky: [85, 0, 0]
    }
  },

  PINCH: {
    id: 'PINCH',
    name: 'Pinch (Thumb + Index)',
    action: 'Left Mouse Click / Drag',
    category: 'click',
    description: 'Brings thumb and index fingertips together within proximity threshold to trigger a crisp left mouse click, or hold to drag.',
    howToPerform: 'Bring the tips of your thumb and index finger together to pinch. Hold to drag, release to drop.',
    iconName: 'CheckCircle',
    emoji: '👌',
    color: '#EAB308',
    accentBg: 'bg-amber-50 border-amber-300 text-amber-950',
    badge: 'Click & Drag',
    thresholdTips: 'Equipped with a 350ms cooldown timer to prevent accidental multi-clicks or double clicks.',
    poseRotations: {
      thumb: [40, -15, 15],
      index: [50, -10, 0],
      middle: [80, 0, 0],
      ring: [80, 0, 0],
      pinky: [80, 0, 0]
    }
  },

  TWO_FINGER_PINCH: {
    id: 'TWO_FINGER_PINCH',
    name: 'Two-Finger Pinch',
    action: 'Right Click / Context Menu',
    category: 'click',
    description: 'Brings thumb and middle fingertips together to instantly open contextual menus or secondary toolbars.',
    howToPerform: 'Pinch your thumb and middle fingertip together while keeping other fingers comfortably back.',
    iconName: 'MousePointerClick',
    emoji: '🤏',
    color: '#CA8A04',
    accentBg: 'bg-yellow-50 border-yellow-300 text-yellow-950',
    badge: 'Context Menu',
    thresholdTips: 'Triggers a native right-click event on Windows, macOS, and Linux desktop environments.',
    poseRotations: {
      thumb: [45, -20, 20],
      index: [15, 0, 0],
      middle: [55, -10, 0],
      ring: [80, 0, 0],
      pinky: [80, 0, 0]
    }
  },

  VICTORY: {
    id: 'VICTORY',
    name: 'Two-Finger Victory (Peace)',
    action: 'Vertical Scrolling',
    category: 'navigation',
    description: 'Extends index and middle fingers in a V-shape. Move your hand up or down to scroll documents and web pages.',
    howToPerform: 'Form a peace / victory sign with index and middle fingers extended. Move hand vertically to scroll.',
    iconName: 'ArrowUpDown',
    emoji: '✌️',
    color: '#FFD633',
    accentBg: 'bg-gestura-goldLight border-gestura-yellow/60 text-gestura-text',
    badge: 'Smooth Scroll',
    thresholdTips: 'Vertical velocity is dynamically amplified based on your custom scroll speed setting.',
    poseRotations: {
      thumb: [65, 20, 10],
      index: [-5, -15, 0],
      middle: [-5, 15, 0],
      ring: [85, 0, 0],
      pinky: [85, 0, 0]
    }
  },

  CLOSED_FIST: {
    id: 'CLOSED_FIST',
    name: 'Closed Fist',
    action: 'Pause Controls / Safe Stop',
    category: 'safety',
    description: 'Curling all fingers into a tight fist instantly freezes mouse movement and halts all computer actions.',
    howToPerform: 'Clench all fingers tightly into a ball or fist. The system locks position safely.',
    iconName: 'ShieldAlert',
    emoji: '✊',
    color: '#171717',
    accentBg: 'bg-neutral-900 border-neutral-700 text-white',
    badge: 'Safety Lock',
    thresholdTips: 'Instant failsafe trigger. No mouse clicks or drag events can happen while fist is held.',
    poseRotations: {
      thumb: [70, 30, 20],
      index: [90, 0, 0],
      middle: [90, 0, 0],
      ring: [90, 0, 0],
      pinky: [90, 0, 0]
    }
  },

  THUMBS_UP: {
    id: 'THUMBS_UP',
    name: 'Thumbs Up',
    action: 'Confirm / Mode Select',
    category: 'system',
    description: 'Thumb pointing upward with remaining fingers folded. Confirms dialogues, dialog buttons, or modal choices.',
    howToPerform: 'Point your thumb straight up towards the ceiling with other four fingers curled into your palm.',
    iconName: 'ThumbsUp',
    emoji: '👍',
    color: '#FACC15',
    accentBg: 'bg-amber-100/90 border-amber-400 text-neutral-900',
    badge: 'Confirmation',
    thresholdTips: 'Checks upward vertical orientation vector relative to hand wrist landmark.',
    poseRotations: {
      thumb: [-30, 0, 0],
      index: [85, 0, 0],
      middle: [85, 0, 0],
      ring: [85, 0, 0],
      pinky: [85, 0, 0]
    }
  }
};
