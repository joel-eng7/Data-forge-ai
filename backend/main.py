"""
GESTURA AI — FastAPI Backend Server & WebSocket Hub
Provides real-time bi-directional communication between the frontend React application
and the Python computer vision / desktop automation engine.
"""

import json
import time
import asyncio
from typing import Dict, Any, List, Set, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pyautogui

from backend.config import config
from backend.computer_control import controller
from backend.gesture_recognition import classifier
from backend.hand_tracking import hand_tracker

app = FastAPI(
    title="GESTURA AI Backend",
    description="Real-Time Hand Gesture Computer Vision & Desktop Control Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket connections
active_connections: Set[WebSocket] = set()


class SettingsUpdatePayload(BaseModel):
    mouse_enabled: bool = True
    click_enabled: bool = True
    right_click_enabled: bool = True
    scroll_enabled: bool = True
    volume_enabled: bool = True
    sensitivity: float = 1.35
    cursor_speed: float = 1.25
    click_delay: float = 0.35
    scroll_speed: float = 1.0
    volume_sensitivity: float = 1.0
    left_handed_mode: bool = False
    enabled_gestures: Dict[str, bool] = Field(default_factory=dict)


class VolumePayload(BaseModel):
    level: int


@app.get("/")
def read_root():
    return {
        "app": "GESTURA AI",
        "tagline": "Your Hands. Your Computer. Your Control.",
        "status": "online",
        "version": "1.0.0",
        "engine_ready": hand_tracker.is_ready,
        "platform": config.to_dict()["platform"]
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "GESTURA AI Engine",
        "version": "1.0.0",
        "engine_ready": hand_tracker.is_ready,
        "active_clients": len(active_connections)
    }


@app.get("/api/status")
def get_status():
    try:
        mouse_x, mouse_y = pyautogui.position()
    except Exception:
        mouse_x, mouse_y = (config.screen_width // 2, config.screen_height // 2)

    return {
        "status": "active",
        "engine_ready": hand_tracker.is_ready,
        "emergency_stopped": config.emergency_stopped,
        "screen": {
            "width": config.screen_width,
            "height": config.screen_height
        },
        "cursor_position": {"x": mouse_x, "y": mouse_y},
        "volume": controller.current_volume,
        "controls": {
            "mouse": config.mouse_enabled,
            "click": config.click_enabled,
            "right_click": config.right_click_enabled,
            "scroll": config.scroll_enabled,
            "volume": config.volume_enabled
        },
        "connected_clients": len(active_connections)
    }


@app.get("/api/settings")
def get_settings():
    return config.to_dict()


@app.post("/api/settings")
def update_settings(payload: SettingsUpdatePayload):
    config.mouse_enabled = payload.mouse_enabled
    config.click_enabled = payload.click_enabled
    config.right_click_enabled = payload.right_click_enabled
    config.scroll_enabled = payload.scroll_enabled
    config.volume_enabled = payload.volume_enabled
    config.sensitivity = payload.sensitivity
    config.cursor_speed = payload.cursor_speed
    config.click_delay = payload.click_delay
    config.scroll_speed = payload.scroll_speed
    config.volume_sensitivity = payload.volume_sensitivity
    config.left_handed_mode = payload.left_handed_mode
    if payload.enabled_gestures:
        config.enabled_gestures.update(payload.enabled_gestures)

    return {"status": "updated", "config": config.to_dict()}


@app.post("/api/emergency-stop")
def trigger_emergency_stop():
    return controller.emergency_stop()


@app.post("/api/resume")
def resume_controls():
    return controller.resume_controls()


@app.get("/api/activity-log")
def get_activity_log():
    return controller.get_activity_log()


@app.get("/api/volume")
def get_volume():
    return {"volume": controller.current_volume}


@app.post("/api/volume")
def set_volume(payload: VolumePayload):
    level = controller.set_system_volume(payload.level)
    return {"volume": level}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)
    print(f"[WebSocket] Client connected. Total active: {len(active_connections)}")

    # Send initial handshake state
    try:
        mouse_pos = pyautogui.position()
    except Exception:
        mouse_pos = type('obj', (object,), {'x': config.screen_width // 2, 'y': config.screen_height // 2})

    try:
        await websocket.send_json({
            "type": "handshake",
            "message": "Connected to GESTURA AI Real-Time Control Engine",
            "screen": {"width": config.screen_width, "height": config.screen_height},
            "mouse": {"x": mouse_pos.x, "y": mouse_pos.y},
            "volume": controller.current_volume,
            "emergency_stopped": config.emergency_stopped,
            "config": config.to_dict()
        })
    except Exception as e:
        print(f"[WebSocket] Error during handshake: {e}")

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
            except Exception:
                continue

            msg_type = message.get("type")

            # 1. PING / PONG
            if msg_type == "ping":
                await websocket.send_json({"type": "pong", "time": time.time()})

            # 2. EMERGENCY STOP
            elif msg_type == "emergency_stop":
                res = controller.emergency_stop()
                await websocket.send_json({
                    "type": "emergency_status",
                    "status": "disarmed",
                    "emergency_stopped": True,
                    "timestamp": time.strftime("%H:%M:%S")
                })

            # 3. RESUME CONTROLS
            elif msg_type == "resume_controls":
                res = controller.resume_controls()
                await websocket.send_json({
                    "type": "emergency_status",
                    "status": "armed",
                    "emergency_stopped": False,
                    "timestamp": time.strftime("%H:%M:%S")
                })

            # 4. SETTINGS UPDATE
            elif msg_type == "update_settings":
                settings_data = message.get("settings", {})
                for k, v in settings_data.items():
                    if hasattr(config, k):
                        setattr(config, k, v)
                await websocket.send_json({
                    "type": "settings_updated",
                    "config": config.to_dict()
                })

            # 5. ACTION DISPATCH: Direct mouse or control event
            elif msg_type == "execute_action":
                action = message.get("action")
                payload = message.get("payload", {})
                executed = False
                details = ""

                if action == "move":
                    nx = payload.get("x")
                    ny = payload.get("y")
                    if nx is not None and ny is not None:
                        new_pos = controller.move_cursor(nx, ny)
                        executed = new_pos is not None
                        details = f"Pos: {new_pos}" if new_pos else "Skipped"

                elif action == "left_click":
                    executed = controller.left_click()
                    details = "Left click"

                elif action == "right_click":
                    executed = controller.right_click()
                    details = "Right click"

                elif action == "scroll":
                    dy = payload.get("dy", 0.0)
                    executed = controller.scroll(dy)
                    details = f"Delta {dy}"

                elif action == "volume":
                    lvl = payload.get("level")
                    if lvl is not None:
                        controller.set_system_volume(lvl)
                        executed = True
                        details = f"Set to {lvl}%"

                # Send execution receipt back
                await websocket.send_json({
                    "type": "action_result",
                    "action": action,
                    "success": executed,
                    "details": details,
                    "timestamp": time.strftime("%H:%M:%S")
                })

            # 6. TELEMETRY: In-browser detected landmark stream
            elif msg_type == "telemetry":
                gesture = message.get("gesture")
                confidence = message.get("confidence", 0.0)
                fingertip = message.get("fingertip", {})
                metrics = message.get("metrics", {})

                # Check if this gesture is enabled
                is_enabled = config.enabled_gestures.get(gesture, True)

                executed_action = None
                action_success = False

                if not config.emergency_stopped and is_enabled:
                    # Move cursor if INDEX_POINTING or OPEN_PALM tracking active
                    if gesture == "INDEX_POINTING":
                        fx = fingertip.get("x")
                        fy = fingertip.get("y")
                        if fx is not None and fy is not None:
                            pos = controller.move_cursor(fx, fy)
                            if pos:
                                executed_action = "MOUSE_MOVE"
                                action_success = True

                    # Left Click on PINCH
                    elif gesture == "PINCH":
                        if controller.left_click():
                            executed_action = "LEFT_CLICK"
                            action_success = True

                    # Right Click on TWO_FINGER_PINCH
                    elif gesture == "TWO_FINGER_PINCH":
                        if controller.right_click():
                            executed_action = "RIGHT_CLICK"
                            action_success = True

                    # Scroll on VICTORY
                    elif gesture == "VICTORY":
                        scroll_dy = metrics.get("scrollDeltaY", metrics.get("scroll_delta_y", 0.0))
                        if abs(scroll_dy) > 0.005:
                            if controller.scroll(scroll_dy):
                                executed_action = "SCROLL"
                                action_success = True

                # Send telemetry update response with latest log
                latest_log = controller.get_activity_log()
                await websocket.send_json({
                    "type": "telemetry_ack",
                    "gesture": gesture,
                    "action_executed": executed_action,
                    "action_success": action_success,
                    "recent_log": latest_log[:10] if latest_log else [],
                    "emergency_stopped": config.emergency_stopped
                })

    except WebSocketDisconnect:
        active_connections.discard(websocket)
        print(f"[WebSocket] Client disconnected. Remaining: {len(active_connections)}")
        if config.auto_stop_on_camera_loss:
            controller.emergency_stop()
    except Exception as e:
        active_connections.discard(websocket)
        print(f"[WebSocket] Connection error: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
