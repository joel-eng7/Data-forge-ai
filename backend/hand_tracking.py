"""
GESTURA AI — Hand Tracking Pipeline
Processes webcam frames or image buffers through MediaPipe HandLandmarker,
extracting 21 3D hand landmarks, calculating latency and drawing stylized pink/white visuals.
"""

import time
import os
import cv2
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
import mediapipe as mp
from mediapipe.tasks.python import vision
from mediapipe.tasks.python.core import base_options

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "hand_landmarker.task")

# Hand connections indices for drawing 21 landmarks
HAND_CONNECTIONS = [
    # Thumb
    (0, 1), (1, 2), (2, 3), (3, 4),
    # Index
    (0, 5), (5, 6), (6, 7), (7, 8),
    # Middle
    (5, 9), (9, 10), (10, 11), (11, 12),
    # Ring
    (9, 13), (13, 14), (14, 15), (15, 16),
    # Pinky
    (13, 17), (17, 18), (18, 19), (19, 20),
    # Palm base
    (0, 17)
]

class HandTracker:
    def __init__(self, model_path: str = MODEL_PATH, max_num_hands: int = 2):
        self.model_path = model_path
        self.max_num_hands = max_num_hands
        self.landmarker: Optional[vision.HandLandmarker] = None
        self.is_ready = False
        self.init_error = ""

        # Performance metrics
        self.last_timestamp_ms = 0
        self.fps = 0.0
        self.latency_ms = 0.0
        self.frame_count = 0
        self.fps_timer = time.time()

        self._initialize_detector()

    def _initialize_detector(self):
        try:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"MediaPipe model file not found at: {self.model_path}")

            options = vision.HandLandmarkerOptions(
                base_options=base_options.BaseOptions(model_asset_path=self.model_path),
                running_mode=vision.RunningMode.IMAGE,
                num_hands=self.max_num_hands,
                min_hand_detection_confidence=0.55,
                min_hand_presence_confidence=0.55,
                min_tracking_confidence=0.55
            )
            self.landmarker = vision.HandLandmarker.create_from_options(options)
            self.is_ready = True
        except Exception as e:
            self.is_ready = False
            self.init_error = str(e)
            print(f"[HandTracker] Initialization warning: {e}")

    def process_frame(self, frame_bgr: np.ndarray) -> Dict[str, Any]:
        """
        Processes an OpenCV BGR frame and returns landmark data and metrics.
        """
        start_time = time.perf_counter()
        if not self.is_ready or self.landmarker is None:
            return {
                "hands": [],
                "hand_count": 0,
                "latency_ms": 0,
                "fps": 0
            }

        # Convert to RGB mp.Image
        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)

        results = self.landmarker.detect(mp_image)

        # Performance calculation
        self.frame_count += 1
        now = time.time()
        if now - self.fps_timer >= 1.0:
            self.fps = round(self.frame_count / (now - self.fps_timer), 1)
            self.frame_count = 0
            self.fps_timer = now

        self.latency_ms = round((time.perf_counter() - start_time) * 1000, 1)

        hands_data = []
        if results.hand_landmarks:
            for idx, hand_lms in enumerate(results.hand_landmarks):
                landmarks_list = []
                for lm in hand_lms:
                    landmarks_list.append({
                        "x": lm.x,
                        "y": lm.y,
                        "z": lm.z
                    })

                handedness = "Right"
                if results.handedness and idx < len(results.handedness):
                    handedness = results.handedness[idx][0].display_name or "Right"

                hands_data.append({
                    "landmarks": landmarks_list,
                    "handedness": handedness,
                    "score": float(results.handedness[idx][0].score) if results.handedness else 0.95
                })

        return {
            "hands": hands_data,
            "hand_count": len(hands_data),
            "latency_ms": self.latency_ms,
            "fps": self.fps
        }

    def draw_styled_landmarks(self, frame_bgr: np.ndarray, landmarks_list: List[Dict[str, float]]) -> np.ndarray:
        """
        Renders elegant pink, rose, and white glowing hand skeleton on the frame.
        """
        h, w, _ = frame_bgr.shape
        overlay = frame_bgr.copy()

        # Convert normalized coords to pixel coords
        pts = [(int(lm["x"] * w), int(lm["y"] * h)) for lm in landmarks_list]

        # Draw bone connections with soft glowing pink lines
        for p1_idx, p2_idx in HAND_CONNECTIONS:
            pt1 = pts[p1_idx]
            pt2 = pts[p2_idx]
            # Outer glow line (rose pink)
            cv2.line(overlay, pt1, pt2, (203, 114, 244), 4, cv2.LINE_AA)
            # Inner bright line (white-pink)
            cv2.line(frame_bgr, pt1, pt2, (255, 235, 245), 2, cv2.LINE_AA)

        # Blend glow overlay
        cv2.addWeighted(overlay, 0.45, frame_bgr, 0.55, 0, frame_bgr)

        # Draw key landmark joints
        for i, pt in enumerate(pts):
            if i in [4, 8, 12, 16, 20]:  # Fingertips
                # Outer circle
                cv2.circle(frame_bgr, pt, 7, (180, 80, 240), -1, cv2.LINE_AA)
                # Core circle
                cv2.circle(frame_bgr, pt, 4, (255, 255, 255), -1, cv2.LINE_AA)
            elif i == 0:  # Wrist
                cv2.circle(frame_bgr, pt, 8, (150, 50, 230), -1, cv2.LINE_AA)
                cv2.circle(frame_bgr, pt, 4, (255, 255, 255), -1, cv2.LINE_AA)
            else:  # Joints
                cv2.circle(frame_bgr, pt, 4, (220, 140, 245), -1, cv2.LINE_AA)
                cv2.circle(frame_bgr, pt, 2, (255, 255, 255), -1, cv2.LINE_AA)

        return frame_bgr

    def close(self):
        if self.landmarker:
            self.landmarker.close()
            self.landmarker = None
            self.is_ready = False


# Global tracker instance
hand_tracker = HandTracker()
