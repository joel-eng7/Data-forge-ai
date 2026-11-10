"""
GESTURA AI — Biomechanical Kinematics & Machine Learning Gesture Recognition
Combines trained Random Forest classification with anatomical geometric heuristics,
sub-pixel tremor suppression, and temporal confirmation.
"""

import os
import math
import time
import joblib
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from collections import deque
from backend.config import config
from backend.train_model import extract_features, GESTURE_CLASSES

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "gesture_classifier.joblib")

class GestureMLClassifier:
    GESTURE_META = {
        "NO_HAND": {
            "name": "No Hand Detected",
            "action": "Standby",
            "emoji": "✋🏻",
            "color": "#94A3B8",
            "description": "Camera active, waiting for hand entrance."
        },
        "OPEN_PALM": {
            "name": "Open Palm",
            "action": "Activate / Pause Cursor Mode",
            "emoji": "🖐️",
            "color": "#FFD633",
            "description": "All fingers extended. Toggles or steadies tracking."
        },
        "INDEX_POINTING": {
            "name": "Index Pointing",
            "action": "Move Mouse Cursor",
            "emoji": "👉",
            "color": "#F5C21B",
            "description": "Index finger extended. Maps tip position to cursor."
        },
        "PINCH": {
            "name": "Pinch (Thumb + Index)",
            "action": "Left Click",
            "emoji": "👌",
            "color": "#E5B800",
            "description": "Thumb and index contact. Triggers left click."
        },
        "TWO_FINGER_PINCH": {
            "name": "Two-Finger Pinch",
            "action": "Right Click / Context Menu",
            "emoji": "🤏",
            "color": "#D4A106",
            "description": "Thumb and middle contact. Opens context menu."
        },
        "VICTORY": {
            "name": "Victory / Peace (2 Fingers)",
            "action": "Vertical Scrolling",
            "emoji": "✌️",
            "color": "#FFE680",
            "description": "Index and middle extended in V. Vertical motion scrolls."
        },
        "CLOSED_FIST": {
            "name": "Closed Fist",
            "action": "Safety Lock / Pause All",
            "emoji": "✊",
            "color": "#171717",
            "description": "All fingers clenched. Emergency movement lock."
        },
        "THUMBS_UP": {
            "name": "Thumbs Up",
            "action": "Confirmation / Select",
            "emoji": "👍",
            "color": "#FFD633",
            "description": "Thumb points upward. Confirms active dialog."
        }
    }

    def __init__(self, history_size: int = 5):
        self.model = None
        self._load_model()
        self.history: deque = deque(maxlen=history_size)
        self.last_confirmed_gesture: str = "NO_HAND"
        self.confirmed_confidence: float = 0.0
        self.confirmation_threshold: int = 3
        self.prev_index_tip_y: Optional[float] = None

    def _load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                print(f"[ML] Gesture Classifier loaded successfully from {MODEL_PATH}")
            except Exception as e:
                print(f"[ML Warning] Could not load model: {e}")
                self.model = None
        else:
            print("[ML Warning] Trained model file not found, will rely on kinematic geometry heuristics.")

    def classify_landmarks(self, landmarks_raw: Optional[List[Any]]) -> Dict[str, Any]:
        """
        Classifies 21 3D landmarks into gesture with probabilities and features.
        landmarks_raw: list of 21 objects/dicts with x, y, z.
        """
        start_time = time.time()
        
        if not landmarks_raw or len(landmarks_raw) < 21:
            self.history.clear()
            self.last_confirmed_gesture = "NO_HAND"
            return {
                "gesture": "NO_HAND",
                "name": self.GESTURE_META["NO_HAND"]["name"],
                "action": self.GESTURE_META["NO_HAND"]["action"],
                "emoji": self.GESTURE_META["NO_HAND"]["emoji"],
                "color": self.GESTURE_META["NO_HAND"]["color"],
                "confidence": 0.0,
                "probabilities": {cls: 0.0 for cls in GESTURE_CLASSES},
                "finger_states": {"thumb": False, "index": False, "middle": False, "ring": False, "pinky": False},
                "metrics": {},
                "latency_ms": 0.1,
                "is_confirmed": False,
                "model_source": "none"
            }

        # Convert to numpy array (21, 3)
        pts = np.zeros((21, 3), dtype=np.float32)
        for i, p in enumerate(landmarks_raw[:21]):
            if isinstance(p, dict):
                pts[i] = [p.get('x', 0.0), p.get('y', 0.0), p.get('z', 0.0)]
            elif isinstance(p, (list, tuple)):
                pts[i] = [p[0], p[1], p[2] if len(p) > 2 else 0.0]
            else:
                pts[i] = [getattr(p, 'x', 0.0), getattr(p, 'y', 0.0), getattr(p, 'z', 0.0)]

        wrist = pts[0]
        thumb_tip, index_tip, middle_tip = pts[4], pts[8], pts[12]
        ring_tip, pinky_tip = pts[16], pts[20]
        index_mcp, index_pip = pts[5], pts[6]
        middle_mcp, middle_pip = pts[9], pts[10]
        ring_mcp, ring_pip = pts[13], pts[14]
        pinky_mcp, pinky_pip = pts[17], pts[18]

        # Calculate hand scale
        hand_scale = float(np.linalg.norm(pts[0] - pts[9]))
        if hand_scale < 1e-4:
            hand_scale = 1.0

        # Finger extensions
        index_ext = bool(index_tip[1] < index_pip[1] and index_tip[1] < index_mcp[1])
        middle_ext = bool(middle_tip[1] < middle_pip[1] and middle_tip[1] < middle_mcp[1])
        ring_ext = bool(ring_tip[1] < ring_pip[1] and ring_tip[1] < ring_mcp[1])
        pinky_ext = bool(pinky_tip[1] < pinky_pip[1] and pinky_tip[1] < pinky_mcp[1])
        thumb_ext = bool(np.linalg.norm(thumb_tip - wrist) > np.linalg.norm(pts[2] - wrist) * 1.2)

        finger_states = {
            "thumb": thumb_ext,
            "index": index_ext,
            "middle": middle_ext,
            "ring": ring_ext,
            "pinky": pinky_ext
        }

        # Key distance ratios
        pinch_dist = float(np.linalg.norm(thumb_tip[:2] - index_tip[:2])) / hand_scale
        two_finger_pinch_dist = float(np.linalg.norm(thumb_tip[:2] - middle_tip[:2])) / hand_scale
        index_middle_dist = float(np.linalg.norm(index_tip[:2] - middle_tip[:2])) / hand_scale

        # Scroll delta Y
        scroll_delta_y = 0.0
        if self.prev_index_tip_y is not None:
            scroll_delta_y = self.prev_index_tip_y - index_tip[1]
        self.prev_index_tip_y = float(index_tip[1])

        # Execute ML prediction if model is loaded
        predicted_gesture = "NO_HAND"
        confidence = 0.70
        probabilities = {cls: 0.0 for cls in GESTURE_CLASSES}
        model_source = "heuristic"

        if self.model is not None:
            try:
                features = extract_features(pts).reshape(1, -1)
                proba = self.model.predict_proba(features)[0]
                for idx, cls_name in enumerate(GESTURE_CLASSES):
                    probabilities[cls_name] = round(float(proba[idx]), 4)
                best_idx = int(np.argmax(proba))
                predicted_gesture = GESTURE_CLASSES[best_idx]
                confidence = float(proba[best_idx])
                model_source = "RandomForest"
            except Exception as e:
                # Fallback to kinematic logic
                pass

        # If model is not loaded or gave low confidence, verify with kinematic rules
        if model_source != "RandomForest" or confidence < 0.65:
            thumb_upward = (thumb_tip[1] < pts[3][1] < pts[2][1]) and (thumb_tip[1] < wrist[1] - (0.2 * hand_scale))
            all_fingers_folded = not index_ext and not middle_ext and not ring_ext and not pinky_ext

            if all_fingers_folded and not thumb_ext:
                predicted_gesture = "CLOSED_FIST"
                confidence = 0.95
            elif thumb_upward and all_fingers_folded:
                predicted_gesture = "THUMBS_UP"
                confidence = 0.96
            elif pinch_dist < config.pinch_threshold * 2.2 and not middle_ext and not ring_ext:
                predicted_gesture = "PINCH"
                confidence = max(0.80, 1.0 - (pinch_dist / (config.pinch_threshold * 2.5)))
            elif two_finger_pinch_dist < config.two_finger_pinch_threshold * 2.2 and not ring_ext and not pinky_ext:
                predicted_gesture = "TWO_FINGER_PINCH"
                confidence = max(0.80, 1.0 - (two_finger_pinch_dist / (config.two_finger_pinch_threshold * 2.5)))
            elif index_ext and middle_ext and not ring_ext and not pinky_ext:
                predicted_gesture = "VICTORY"
                confidence = 0.94
            elif index_ext and not middle_ext and not ring_ext and not pinky_ext:
                predicted_gesture = "INDEX_POINTING"
                confidence = 0.96
            elif index_ext and middle_ext and ring_ext and pinky_ext:
                predicted_gesture = "OPEN_PALM"
                confidence = 0.95
            probabilities[predicted_gesture] = round(confidence, 4)

        # Temporal confirmation smoothing
        self.history.append(predicted_gesture)
        counts = {}
        for g in self.history:
            counts[g] = counts.get(g, 0) + 1

        most_common = max(counts, key=counts.get)
        is_confirmed = counts[most_common] >= self.confirmation_threshold

        if is_confirmed:
            self.last_confirmed_gesture = most_common
            self.confirmed_confidence = confidence

        final_gesture = self.last_confirmed_gesture if is_confirmed else predicted_gesture
        meta = self.GESTURE_META.get(final_gesture, self.GESTURE_META["NO_HAND"])

        latency_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "gesture": final_gesture,
            "raw_gesture": predicted_gesture,
            "name": meta["name"],
            "action": meta["action"],
            "emoji": meta["emoji"],
            "color": meta["color"],
            "confidence": round(confidence, 3),
            "probabilities": probabilities,
            "finger_states": finger_states,
            "metrics": {
                "pinch_distance": round(pinch_dist, 3),
                "two_finger_pinch_distance": round(two_finger_pinch_dist, 3),
                "index_middle_distance": round(index_middle_dist, 3),
                "scroll_delta_y": round(scroll_delta_y, 4),
                "fingertip": {"x": round(float(index_tip[0]), 4), "y": round(float(index_tip[1]), 4)},
                "hand_scale": round(hand_scale, 3)
            },
            "latency_ms": latency_ms,
            "is_confirmed": is_confirmed,
            "model_source": model_source
        }

    def classify(self, landmarks_raw: Optional[List[Any]], handedness: str = "Right") -> Dict[str, Any]:
        return self.classify_landmarks(landmarks_raw)

# Global singleton
classifier = GestureMLClassifier()
