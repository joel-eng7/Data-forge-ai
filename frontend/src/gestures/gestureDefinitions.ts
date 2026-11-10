/**
 * GESTURA AI — Gesture Definitions & Specifications
 * Full catalogue of 7 computer control gestures with actions, 3D poses, and instructions.
 * Strictly adheres to the Premium Pink & White 3D Theme.
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
    description: 'Extends all five fingers in a relaxed, open hand position to activate or pause gesture tracking.',
    howToPerform: 'Spread all five fingers comfortably facing the camera. Hold steady for 0.3s to toggle.',
    iconName: 'Hand',
    emoji: '🖐️',
    color: '#FB7185',
    accentBg: 'bg-rose-50 border-rose-200 text-rose-700',
    badge: 'Tracking Toggle',
    thresholdTips: 'Requires all 5 fingers extended. Keeps your cursor ready without unintended movements.',
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
    color: '#F43F5E',
    accentBg: 'bg-rose-100/60 border-rose-300 text-rose-800',
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
    action: 'Left Mouse Click',
    category: 'click',
    description: 'Brings thumb and index fingertips together within proximity threshold to trigger a crisp left mouse click.',
    howToPerform: 'Bring the tips of your thumb and index finger together to pinch. Release to complete click.',
    iconName: 'CheckCircle',
    emoji: '👌',
    color: '#EC4899',
    accentBg: 'bg-pink-100/70 border-pink-300 text-pink-800',
    badge: 'Primary Click',
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
    action: 'Right Mouse Click',
    category: 'click',
    description: 'Brings thumb and middle fingertips (or index and middle) together to instantly open contextual menus.',
    howToPerform: 'Pinch your thumb and middle fingertip together while keeping other fingers comfortably back.',
    iconName: 'MousePointerClick',
    emoji: '🤏',
    color: '#D946EF',
    accentBg: 'bg-fuchsia-100/60 border-fuchsia-300 text-fuchsia-800',
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
    color: '#A855F7',
    accentBg: 'bg-purple-100/60 border-purple-300 text-purple-800',
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
    color: '#E11D48',
    accentBg: 'bg-rose-100 border-rose-300 text-rose-900',
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
    action: 'Activate Confirmation Mode',
    category: 'system',
    description: 'Thumb pointing upward with remaining fingers folded. Confirms dialogues, dialog buttons, or modal choices.',
    howToPerform: 'Point your thumb straight up towards the ceiling with other four fingers curled into your palm.',
    iconName: 'ThumbsUp',
    emoji: '👍',
    color: '#10B981',
    accentBg: 'bg-emerald-100/70 border-emerald-300 text-emerald-800',
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
