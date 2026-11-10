"""
GESTURA AI — FastAPI Backend Server, Machine Learning Inference Engine & WebSocket Hub
Provides high-performance REST APIs, WebSocket streaming, and persistent SQLite telemetry
for real-time computer vision gesture control and kinematic ML analysis.
"""

import os
import json
import time
import asyncio
from typing import Dict, Any, List, Optional, Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pyautogui

from backend.config import config
from backend.computer_control import controller
from backend.gesture_recognition import classifier
from backend.hand_tracking import hand_tracker
from backend.train_model import GESTURE_CLASSES, generate_pose_landmarks, METRICS_PATH
from backend.models.database import (
    init_db,
    log_telemetry_event,
    get_recent_telemetry,
    save_benchmark_result,
    get_recent_benchmarks
)

# Initialize database schema
init_db()

app = FastAPI(
    title="GESTURA AI Backend Engine",
    description="Touchless Spatial Computing, Biomechanical ML & Aseptic Computer Vision API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

active_connections: Set[WebSocket] = set()

# Pydantic Schemas
class LandmarkPointModel(BaseModel):
    x: float
    y: float
    z: float = 0.0

class PredictPayload(BaseModel):
    landmarks: List[LandmarkPointModel]
    session_id: Optional[str] = "web_session"
    trigger_action: Optional[bool] = False

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

class BenchmarkRunPayload(BaseModel):
    suite: str = "surgical"
    samples_per_gesture: int = 25


@app.get("/")
def read_root():
    return {
        "app": "GESTURA AI",
        "tagline": "Touchless Spatial Intelligence & Aseptic Vision",
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
        "model_loaded": classifier.model is not None,
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
    config.sensitivity = max(0.2, min(payload.sensitivity, 3.5))
    config.cursor_speed = max(0.2, min(payload.cursor_speed, 3.5))
    config.click_delay = max(0.1, min(payload.click_delay, 1.5))
    config.scroll_speed = max(0.2, min(payload.scroll_speed, 3.0))
    config.volume_sensitivity = max(0.2, min(payload.volume_sensitivity, 3.0))
    config.left_handed_mode = payload.left_handed_mode
    if payload.enabled_gestures:
        config.enabled_gestures.update(payload.enabled_gestures)
    return {"status": "updated", "settings": config.to_dict()}


@app.post("/api/emergency-stop")
def emergency_stop():
    res = controller.emergency_stop()
    log_telemetry_event("CLOSED_FIST", 1.0, "EMERGENCY_STOP", 0.5)
    return res


@app.post("/api/resume")
def resume_controls():
    res = controller.resume_controls()
    log_telemetry_event("OPEN_PALM", 1.0, "RESUME_CONTROLS", 0.5)
    return res


@app.post("/api/volume")
def set_volume(payload: VolumePayload):
    controller.set_system_volume(payload.level)
    return {"status": "volume_set", "level": payload.level}


@app.get("/api/activity-log")
def get_activity_log():
    return controller.get_activity_log()


@app.post("/api/predict")
def predict_gesture(payload: PredictPayload):
    """
    Real Machine Learning inference on 21 3D hand landmarks.
    Computes 83 biomechanical kinematic features and classifies intent via calibrated Random Forest.
    """
    raw_pts = [p.dict() for p in payload.landmarks]
    result = classifier.classify_landmarks(raw_pts)

    action_executed = None
    if payload.trigger_action and not config.emergency_stopped:
        gesture = result["gesture"]
        if config.enabled_gestures.get(gesture, True):
            if gesture == "INDEX_POINTING":
                fx = result["metrics"]["fingertip"]["x"]
                fy = result["metrics"]["fingertip"]["y"]
                pos = controller.move_cursor(fx, fy)
                if pos:
                    action_executed = "MOUSE_MOVE"
            elif gesture == "PINCH":
                if controller.left_click():
                    action_executed = "LEFT_CLICK"
            elif gesture == "TWO_FINGER_PINCH":
                if controller.right_click():
                    action_executed = "RIGHT_CLICK"
            elif gesture == "VICTORY":
                s_dy = result["metrics"].get("scroll_delta_y", 0.0)
                if abs(s_dy) > 0.005:
                    if controller.scroll(s_dy):
                        action_executed = "SCROLL"

    result["action_executed"] = action_executed

    if result["gesture"] != "NO_HAND":
        log_telemetry_event(
            gesture=result["gesture"],
            confidence=result["confidence"],
            action=action_executed or result["action"],
            latency_ms=result["latency_ms"],
            session_id=payload.session_id or "web"
        )

    return result


@app.get("/api/presets")
def get_gesture_presets():
    """
    Returns pre-calculated 3D anatomical landmark positions for all 7 gestures.
    Allows testing and calibration without requiring a live webcam.
    """
    presets = {}
    for g_id in GESTURE_CLASSES:
        pts = generate_pose_landmarks(g_id, noise_level=0.0).tolist()
        meta = classifier.GESTURE_META.get(g_id, {})
        presets[g_id] = {
            "gesture": g_id,
            "name": meta.get("name", g_id),
            "action": meta.get("action", "None"),
            "emoji": meta.get("emoji", "✋"),
            "color": meta.get("color", "#FFD633"),
            "description": meta.get("description", ""),
            "landmarks": [{"x": round(p[0], 4), "y": round(p[1], 4), "z": round(p[2], 4)} for p in pts]
        }
    return presets


@app.get("/api/model-info")
def get_model_info():
    """
    Returns AI Technical Transparency metrics, confusion matrix, ROC-AUC, and feature importances.
    """
    if os.path.exists(METRICS_PATH):
        try:
            with open(METRICS_PATH, "r") as f:
                metrics = json.load(f)
            return metrics
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error reading model metrics: {e}")
    else:
        raise HTTPException(status_code=404, detail="Model metrics file not found. Run train_model.py first.")


@app.post("/api/benchmark")
def run_benchmark(payload: BenchmarkRunPayload):
    """
    Executes live benchmark evaluation on clinical or accessibility test suites.
    Measures accuracy, per-class F1, and mean inference latency.
    """
    start_time = time.time()
    noise_map = {
        "surgical": 0.012,
        "accessibility": 0.025,
        "noise": 0.045
    }
    noise_level = noise_map.get(payload.suite, 0.02)

    total_samples = 0
    correct_count = 0
    latencies = []
    class_results = {}

    for g_id in GESTURE_CLASSES:
        class_correct = 0
        for _ in range(payload.samples_per_gesture):
            total_samples += 1
            pts = generate_pose_landmarks(g_id, noise_level=noise_level)
            t0 = time.time()
            res = classifier.classify_landmarks(pts.tolist())
            latencies.append((time.time() - t0) * 1000)
            if res["gesture"] == g_id:
                correct_count += 1
                class_correct += 1

        class_acc = class_correct / payload.samples_per_gesture
        class_results[g_id] = {
            "samples": payload.samples_per_gesture,
            "correct": class_correct,
            "accuracy": round(class_acc * 100, 1),
            "status": "PASS" if class_acc >= 0.90 else "WARNING"
        }

    overall_acc = correct_count / total_samples if total_samples > 0 else 0.0
    avg_latency = float(sum(latencies) / len(latencies)) if latencies else 0.0

    summary = {
        "suite": payload.suite,
        "noise_level": noise_level,
        "total_samples": total_samples,
        "accuracy": round(overall_acc * 100, 2),
        "avg_latency_ms": round(avg_latency, 2),
        "min_latency_ms": round(min(latencies), 2) if latencies else 0.0,
        "max_latency_ms": round(max(latencies), 2) if latencies else 0.0,
        "class_breakdown": class_results,
        "status": "OPTIMAL" if overall_acc >= 0.95 else "ACCEPTABLE",
        "evaluated_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    run_id = save_benchmark_result(
        suite_name=payload.suite,
        total_samples=total_samples,
        accuracy=overall_acc,
        avg_latency_ms=avg_latency,
        results=summary
    )
    summary["benchmark_id"] = run_id
    return summary


@app.get("/api/benchmarks/history")
def get_benchmarks_history():
    return get_recent_benchmarks(limit=10)


@app.get("/api/telemetry")
def get_telemetry_history():
    return get_recent_telemetry(limit=30)


# High-Throughput WebSocket
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)

    try:
        await websocket.send_json({
            "type": "welcome",
            "message": "Connected to GESTURA AI WebSocket Hub",
            "version": "1.0.0",
            "settings": config.to_dict()
        })

        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
            except Exception:
                continue

            msg_type = message.get("type")

            if msg_type == "ping":
                await websocket.send_json({"type": "pong", "time": time.time()})

            elif msg_type == "emergency_stop":
                controller.emergency_stop()
                await websocket.send_json({"type": "status_update", "emergency_stopped": True})

            elif msg_type == "resume_controls":
                controller.resume_controls()
                await websocket.send_json({"type": "status_update", "emergency_stopped": False})

            elif msg_type == "execute_action":
                action = message.get("action")
                payload = message.get("payload", {})
                executed = False
                details = ""

                if action == "volume":
                    lvl = payload.get("level")
                    if lvl is not None:
                        controller.set_system_volume(lvl)
                        executed = True
                        details = f"Volume: {lvl}%"

                await websocket.send_json({
                    "type": "action_result",
                    "action": action,
                    "success": executed,
                    "details": details,
                    "timestamp": time.strftime("%H:%M:%S")
                })

            elif msg_type == "telemetry":
                gesture = message.get("gesture")
                confidence = message.get("confidence", 0.0)
                fingertip = message.get("fingertip", {})
                metrics = message.get("metrics", {})

                is_enabled = config.enabled_gestures.get(gesture, True)
                executed_action = None
                action_success = False

                if not config.emergency_stopped and is_enabled:
                    if gesture == "INDEX_POINTING":
                        # Release left button if previously held in pinch drag
                        if controller.is_left_button_down:
                            controller.mouse_up(button='left')

                        fx = fingertip.get("x")
                        fy = fingertip.get("y")
                        if fx is not None and fy is not None:
                            pos = controller.move_cursor(fx, fy)
                            if pos:
                                executed_action = "MOUSE_MOVE"
                                action_success = True

                    elif gesture == "PINCH":
                        # Move cursor as well so drag-and-drop moves to new position
                        fx = fingertip.get("x")
                        fy = fingertip.get("y")
                        if fx is not None and fy is not None:
                            controller.move_cursor(fx, fy)

                        if controller.left_click():
                            executed_action = "LEFT_CLICK"
                            action_success = True

                    elif gesture == "TWO_FINGER_PINCH":
                        if controller.right_click():
                            executed_action = "RIGHT_CLICK"
                            action_success = True

                    elif gesture == "VICTORY":
                        scroll_dy = metrics.get("scroll_delta_y", metrics.get("scrollDeltaY", 0.0))
                        if abs(scroll_dy) > 0.003:
                            if controller.scroll(scroll_dy):
                                executed_action = "SCROLL"
                                action_success = True

                    elif gesture == "CLOSED_FIST":
                        controller.emergency_stop()
                        executed_action = "SAFE_STOP"
                        action_success = True

                    elif gesture == "THUMBS_UP":
                        if controller.confirm_action():
                            executed_action = "CONFIRM"
                            action_success = True

                    elif gesture == "OPEN_PALM":
                        # Open palm steadies cursor and resets previous positions
                        controller.prev_cursor_x = None
                        controller.prev_cursor_y = None
                        executed_action = "STEADY_TRACKING"
                        action_success = True

                await websocket.send_json({
                    "type": "telemetry_ack",
                    "gesture": gesture,
                    "action_executed": executed_action,
                    "action_success": action_success,
                    "recent_log": controller.get_activity_log()[:8],
                    "emergency_stopped": config.emergency_stopped
                })

    except WebSocketDisconnect:
        active_connections.discard(websocket)
    except Exception as e:
        active_connections.discard(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
