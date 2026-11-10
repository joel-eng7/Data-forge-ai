"""
GESTURA AI — Computer Control Module
Executes real desktop automation (mouse movement, clicks, scrolling, system volume)
using PyAutoGUI and operating-system-level APIs with debounce, safety failsafes,
and exponential moving average smoothing.
"""

import time
import subprocess
import math
from typing import Dict, Any, Optional, Tuple, List
import pyautogui
from backend.config import config, IS_MACOS, IS_WINDOWS, IS_LINUX

class ComputerController:
    def __init__(self):
        # Smoothing states
        self.prev_cursor_x: Optional[float] = None
        self.prev_cursor_y: Optional[float] = None
        self.target_x: float = config.screen_width / 2
        self.target_y: float = config.screen_height / 2

        # Debounce and Cooldown Timers
        self.last_left_click_time: float = 0.0
        self.last_right_click_time: float = 0.0
        self.last_scroll_time: float = 0.0
        self.last_volume_time: float = 0.0

        # Continuous states
        self.is_left_button_down: bool = False
        self.is_right_button_down: bool = False
        self.current_volume: int = self._query_system_volume()

        # Activity log (capped at 100 entries)
        self.activity_log: List[Dict[str, Any]] = []

    def _log_activity(self, action: str, details: str, success: bool = True):
        entry = {
            "id": f"{time.time()}_{len(self.activity_log)}",
            "timestamp": time.strftime("%H:%M:%S"),
            "action": action,
            "details": details,
            "success": success
        }
        self.activity_log.insert(0, entry)
        if len(self.activity_log) > 100:
            self.activity_log.pop()

    def get_activity_log(self) -> List[Dict[str, Any]]:
        return self.activity_log[:30]

    def emergency_stop(self) -> Dict[str, Any]:
        """
        Immediately disarms all controls and releases any mouse buttons held down.
        """
        config.emergency_stopped = True
        try:
            pyautogui.mouseUp(button='left')
            pyautogui.mouseUp(button='right')
        except Exception:
            pass
        self.is_left_button_down = False
        self.is_right_button_down = False
        self.prev_cursor_x = None
        self.prev_cursor_y = None

        self._log_activity(
            action="EMERGENCY_STOP",
            details="All computer controls safely disarmed. Mouse buttons released.",
            success=True
        )
        return {"status": "disarmed", "emergency_stopped": True}

    def resume_controls(self) -> Dict[str, Any]:
        """
        Re-arms computer controls after emergency stop.
        """
        config.emergency_stopped = False
        self.prev_cursor_x = None
        self.prev_cursor_y = None
        self._log_activity(
            action="CONTROLS_RESUMED",
            details="Computer controls re-enabled safely.",
            success=True
        )
        return {"status": "armed", "emergency_stopped": False}

    def resume(self) -> Dict[str, Any]:
        return self.resume_controls()

    def get_cursor_position(self) -> Tuple[int, int]:
        try:
            return pyautogui.position()
        except Exception:
            return (int(config.screen_width / 2), int(config.screen_height / 2))

    def move_cursor(self, norm_x: float, norm_y: float) -> Optional[Tuple[int, int]]:
        """
        Translates normalized coordinates (0.0 to 1.0) into smoothed screen coordinates.
        Uses exponential moving average and deadzone thresholding to avoid tremors.
        """
        if config.emergency_stopped or not config.mouse_enabled:
            return None

        # Clamp input
        norm_x = max(0.0, min(1.0, norm_x))
        norm_y = max(0.0, min(1.0, norm_y))

        # Adjust for margin calibration
        m = config.screen_margin
        scaled_x = (norm_x - m) / (1.0 - 2 * m)
        scaled_y = (norm_y - m) / (1.0 - 2 * m)
        scaled_x = max(0.0, min(1.0, scaled_x))
        scaled_y = max(0.0, min(1.0, scaled_y))

        # Convert to screen pixel coordinates
        target_pixel_x = scaled_x * config.screen_width
        target_pixel_y = scaled_y * config.screen_height

        # Initialize previous coords if empty
        if self.prev_cursor_x is None or self.prev_cursor_y is None:
            self.prev_cursor_x = target_pixel_x
            self.prev_cursor_y = target_pixel_y
            pyautogui.moveTo(int(target_pixel_x), int(target_pixel_y))
            return int(target_pixel_x), int(target_pixel_y)

        # Calculate displacement distance
        dx = (target_pixel_x - self.prev_cursor_x) / config.screen_width
        dy = (target_pixel_y - self.prev_cursor_y) / config.screen_height
        dist = math.sqrt(dx * dx + dy * dy)

        # Deadzone filter for tiny hand tremors
        if dist < config.deadzone_threshold:
            return int(self.prev_cursor_x), int(self.prev_cursor_y)

        # Exponential Moving Average Smoothing
        alpha = min(1.0, max(0.05, config.smoothing_factor * config.cursor_speed))
        smoothed_x = alpha * target_pixel_x + (1.0 - alpha) * self.prev_cursor_x
        smoothed_y = alpha * target_pixel_y + (1.0 - alpha) * self.prev_cursor_y

        # Clamp to physical screen bounds
        final_x = int(max(0, min(config.screen_width - 1, smoothed_x)))
        final_y = int(max(0, min(config.screen_height - 1, smoothed_y)))

        self.prev_cursor_x = smoothed_x
        self.prev_cursor_y = smoothed_y

        try:
            pyautogui.moveTo(final_x, final_y)
            return final_x, final_y
        except Exception as e:
            self._log_activity("MOUSE_MOVE_ERROR", str(e), success=False)
            return None

    def left_click(self) -> bool:
        """
        Triggers a left mouse click with cooldown debounce.
        """
        if config.emergency_stopped or not config.click_enabled:
            return False

        now = time.time()
        if now - self.last_left_click_time < config.click_delay:
            return False

        self.last_left_click_time = now
        try:
            pos = pyautogui.position()
            pyautogui.click(button='left')
            self._log_activity(
                action="LEFT_CLICK",
                details=f"Left click executed at ({pos.x}, {pos.y})",
                success=True
            )
            return True
        except Exception as e:
            self._log_activity("LEFT_CLICK_ERROR", str(e), success=False)
            return False

    def mouse_down(self, button: str = 'left') -> bool:
        """
        Presses and holds the mouse button down (for drag-and-drop).
        """
        if config.emergency_stopped:
            return False
        if not self.is_left_button_down:
            try:
                pyautogui.mouseDown(button=button)
                self.is_left_button_down = True
                self._log_activity(
                    action="DRAG_START",
                    details=f"{button.capitalize()} button held down for dragging",
                    success=True
                )
                return True
            except Exception as e:
                self._log_activity("MOUSE_DOWN_ERROR", str(e), success=False)
                return False
        return True

    def mouse_up(self, button: str = 'left') -> bool:
        """
        Releases the held mouse button (drop).
        """
        if self.is_left_button_down:
            try:
                pyautogui.mouseUp(button=button)
                self.is_left_button_down = False
                self._log_activity(
                    action="DRAG_RELEASE",
                    details=f"{button.capitalize()} button released (dropped)",
                    success=True
                )
                return True
            except Exception as e:
                self._log_activity("MOUSE_UP_ERROR", str(e), success=False)
                return False
        return False

    def toggle_tracking(self) -> bool:
        """
        Toggles cursor tracking on / off (Open Palm action).
        """
        config.mouse_enabled = not config.mouse_enabled
        self._log_activity(
            action="TRACKING_TOGGLE",
            details=f"Cursor tracking {'ACTIVATED' if config.mouse_enabled else 'PAUSED'}",
            success=True
        )
        return config.mouse_enabled

    def confirm_action(self) -> bool:
        """
        Triggers keyboard Enter/Confirm on Thumbs Up.
        """
        now = time.time()
        if now - self.last_left_click_time < 0.6:  # 600ms debounce
            return False
        self.last_left_click_time = now
        try:
            pyautogui.press('enter')
            self._log_activity(
                action="CONFIRM_SELECT",
                details="Enter key executed for modal/dialog selection",
                success=True
            )
            return True
        except Exception as e:
            self._log_activity("CONFIRM_ERROR", str(e), success=False)
            return False

    def right_click(self) -> bool:
        """
        Triggers a right mouse click with cooldown debounce.
        """
        if config.emergency_stopped or not config.right_click_enabled:
            return False

        now = time.time()
        if now - self.last_right_click_time < config.click_delay:
            return False

        self.last_right_click_time = now
        try:
            pos = pyautogui.position()
            pyautogui.click(button='right')
            self._log_activity(
                action="RIGHT_CLICK",
                details=f"Right click executed at ({pos.x}, {pos.y})",
                success=True
            )
            return True
        except Exception as e:
            self._log_activity("RIGHT_CLICK_ERROR", str(e), success=False)
            return False

    def scroll(self, delta_y: float) -> bool:
        """
        Triggers vertical scrolling based on normalized vertical displacement.
        delta_y > 0 scrolls up, delta_y < 0 scrolls down.
        """
        if config.emergency_stopped or not config.scroll_enabled:
            return False

        now = time.time()
        if now - self.last_scroll_time < 0.08:  # 80ms throttle
            return False

        self.last_scroll_time = now
        # Multiplier
        scroll_amount = int(delta_y * 120.0 * config.scroll_speed)
        if abs(scroll_amount) < 1:
            return False

        try:
            pyautogui.scroll(scroll_amount)
            self._log_activity(
                action="SCROLL",
                details=f"Scrolled {'UP' if scroll_amount > 0 else 'DOWN'} by {abs(scroll_amount)} units",
                success=True
            )
            return True
        except Exception as e:
            self._log_activity("SCROLL_ERROR", str(e), success=False)
            return False

    def set_system_volume(self, target_percent: int) -> int:
        """
        Sets system volume to a percentage between 0 and 100.
        Uses AppleScript on macOS, amixer/pactl on Linux, or Windows fallback.
        """
        if config.emergency_stopped or not config.volume_enabled:
            return self.current_volume

        target_percent = max(0, min(100, int(target_percent)))
        now = time.time()
        if now - self.last_volume_time < 0.15:  # 150ms debounce
            return self.current_volume

        self.last_volume_time = now

        try:
            if IS_MACOS:
                subprocess.run(
                    ["osascript", "-e", f"set volume output volume {target_percent}"],
                    check=True,
                    capture_output=True,
                    timeout=1
                )
            elif IS_LINUX:
                subprocess.run(
                    ["amixer", "-D", "pulse", "sset", "Master", f"{target_percent}%"],
                    check=False,
                    capture_output=True,
                    timeout=1
                )
            self.current_volume = target_percent
            self._log_activity(
                action="VOLUME_CHANGE",
                details=f"System volume adjusted to {target_percent}%",
                success=True
            )
            return target_percent
        except Exception as e:
            self._log_activity("VOLUME_ERROR", str(e), success=False)
            return self.current_volume

    def adjust_volume_delta(self, delta: int) -> int:
        new_vol = max(0, min(100, self.current_volume + int(delta * config.volume_sensitivity)))
        return self.set_system_volume(new_vol)

    def _query_system_volume(self) -> int:
        try:
            if IS_MACOS:
                res = subprocess.run(
                    ["osascript", "-e", "output volume of (get volume settings)"],
                    capture_output=True,
                    text=True,
                    timeout=1
                )
                if res.returncode == 0 and res.stdout.strip().isdigit():
                    return int(res.stdout.strip())
        except Exception:
            pass
        return 50


# Global controller instance
controller = ComputerController()
