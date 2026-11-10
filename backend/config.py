"""
GESTURA AI — Configuration
Defines settings, constants, and calibration parameters for the Gestura AI computer control system.
"""

import os
import platform
from dataclasses import dataclass, field
from typing import Dict, Any
import pyautogui

# Operating System
IS_MACOS = platform.system() == "Darwin"
IS_WINDOWS = platform.system() == "Windows"
IS_LINUX = platform.system() == "Linux"

# PyAutoGUI Safety Settings
pyautogui.FAILSAFE = True  # Move mouse to upper-left corner to abort
pyautogui.PAUSE = 0.001    # Minimized pause for fluid real-time cursor tracking

# Retrieve Screen Dimensions
try:
    SCREEN_WIDTH, SCREEN_HEIGHT = pyautogui.size()
except Exception:
    SCREEN_WIDTH, SCREEN_HEIGHT = (1920, 1080)


@dataclass
class GestureConfig:
    # Server / WebSocket
    host: str = "127.0.0.1"
    port: int = 8000

    # Screen dimensions
    screen_width: int = SCREEN_WIDTH
    screen_height: int = SCREEN_HEIGHT

    # Mouse Control
    mouse_enabled: bool = True
    click_enabled: bool = True
    right_click_enabled: bool = True
    scroll_enabled: bool = True
    volume_enabled: bool = True
    emergency_stopped: bool = False

    # Dynamic Sensitivity & Speeds
    sensitivity: float = 1.35            # Multiplier for cursor displacement
    cursor_speed: float = 1.25          # Cursor speed factor
    click_delay: float = 0.35           # Cooldown seconds between clicks
    scroll_speed: float = 1.0           # Multiplier for scroll distance
    volume_sensitivity: float = 1.0     # Multiplier for volume changes

    # Smoothing & Deadzone
    smoothing_factor: float = 0.28      # Exponential moving average alpha (0.0 to 1.0)
    deadzone_threshold: float = 0.003   # Normalized distance threshold to ignore hand tremors
    screen_margin: float = 0.08         # Normalized margin from frame border mapped to screen edge

    # Hand Geometry Thresholds
    pinch_threshold: float = 0.045      # Normalized euclidean distance thumb-to-index
    pinch_release_threshold: float = 0.075 # Hysteresis release distance
    two_finger_pinch_threshold: float = 0.048 # Thumb to middle or index to middle
    scroll_activation_distance: float = 0.015 # Minimal vertical motion to register scroll
    thumb_up_angle_threshold: float = 65.0  # Max degrees from vertical upward axis

    # Safety
    auto_stop_on_camera_loss: bool = True
    left_handed_mode: bool = False

    # Enabled Gestures Map
    enabled_gestures: Dict[str, bool] = field(default_factory=lambda: {
        "OPEN_PALM": True,
        "INDEX_POINTING": True,
        "PINCH": True,
        "TWO_FINGER_PINCH": True,
        "VICTORY": True,
        "CLOSED_FIST": True,
        "THUMBS_UP": True,
    })

    def to_dict(self) -> Dict[str, Any]:
        return {
            "screen_width": self.screen_width,
            "screen_height": self.screen_height,
            "mouse_enabled": self.mouse_enabled,
            "click_enabled": self.click_enabled,
            "right_click_enabled": self.right_click_enabled,
            "scroll_enabled": self.scroll_enabled,
            "volume_enabled": self.volume_enabled,
            "emergency_stopped": self.emergency_stopped,
            "sensitivity": self.sensitivity,
            "cursor_speed": self.cursor_speed,
            "click_delay": self.click_delay,
            "scroll_speed": self.scroll_speed,
            "volume_sensitivity": self.volume_sensitivity,
            "smoothing_factor": self.smoothing_factor,
            "left_handed_mode": self.left_handed_mode,
            "enabled_gestures": self.enabled_gestures,
            "platform": platform.system()
        }


# Global singleton instance
config = GestureConfig()
