/**
 * GESTURA AI — Frontend API & WebSocket Service Layer
 * Fully typed client communicating with FastAPI backend and SQLite data layer.
 */

const metaEnv = (import.meta as any).env || {};
const API_BASE_URL = metaEnv.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const WS_BASE_URL = metaEnv.VITE_WS_BASE_URL || 'ws://127.0.0.1:8000/ws';

export interface BackendStatus {
  status: string;
  engine_ready: boolean;
  emergency_stopped: boolean;
  screen: { width: number; height: number };
  cursor_position: { x: number; y: number };
  volume: number;
  controls: {
    mouse: boolean;
    click: boolean;
    right_click: boolean;
    scroll: boolean;
    volume: boolean;
  };
  connected_clients: number;
}

export interface SystemSettings {
  mouse_enabled: boolean;
  click_enabled: boolean;
  right_click_enabled: boolean;
  scroll_enabled: boolean;
  volume_enabled: boolean;
  emergency_stopped?: boolean;
  sensitivity: number;
  cursor_speed: number;
  click_delay: number;
  scroll_speed: number;
  volume_sensitivity: number;
  smoothing_factor?: number;
  left_handed_mode: boolean;
  enabled_gestures: Record<string, boolean>;
  screen_width?: number;
  screen_height?: number;
  platform?: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  success: boolean;
}

export type ActivityLogItem = ActivityLogEntry;

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

export interface GesturePrediction {
  gesture: string;
  raw_gesture: string;
  name: string;
  action: string;
  emoji: string;
  color: string;
  confidence: number;
  probabilities: Record<string, number>;
  finger_states: {
    thumb: boolean;
    index: boolean;
    middle: boolean;
    ring: boolean;
    pinky: boolean;
  };
  metrics: {
    pinch_distance: number;
    two_finger_pinch_distance: number;
    index_middle_distance: number;
    scroll_delta_y: number;
    fingertip: { x: number; y: number };
    hand_scale: number;
  };
  latency_ms: number;
  is_confirmed: boolean;
  model_source: string;
  action_executed?: string | null;
}

export interface GesturePreset {
  gesture: string;
  name: string;
  action: string;
  emoji: string;
  color: string;
  description: string;
  landmarks: LandmarkPoint[];
}

export interface ModelMetrics {
  model_name: string;
  total_samples: number;
  feature_count: number;
  test_samples: number;
  accuracy: number;
  macro_f1: number;
  cv_accuracy_mean: number;
  cv_accuracy_std: number;
  confusion_matrix: number[][];
  classes: string[];
  classification_report: Record<string, {
    precision: number;
    recall: number;
    'f1-score': number;
    support: number;
  }>;
  top_features: Array<{ name: string; importance: number }>;
  inference_latency_ms: number;
  trained_timestamp: string;
}

export interface BenchmarkResult {
  suite: string;
  noise_level: number;
  total_samples: number;
  accuracy: number;
  avg_latency_ms: number;
  min_latency_ms: number;
  max_latency_ms: number;
  class_breakdown: Record<string, {
    samples: number;
    correct: number;
    accuracy: number;
    status: string;
  }>;
  status: string;
  evaluated_at: string;
  benchmark_id: string;
}

export interface TelemetryLog {
  id: number;
  session_id: string;
  gesture: string;
  confidence: number;
  action: string;
  latency_ms: number;
  timestamp: string;
}

export const api = {
  async getHealth(): Promise<{ status: string; service: string; version: string; model_loaded: boolean } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getStatus(): Promise<BackendStatus | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/status`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getSettings(): Promise<SystemSettings | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<{ status: string; settings: SystemSettings } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async triggerEmergencyStop(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/emergency-stop`, { method: 'POST' });
      return res.ok;
    } catch {
      return false;
    }
  },

  async resumeControls(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/resume`, { method: 'POST' });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getActivityLog(): Promise<ActivityLogEntry[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/activity-log`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async setVolume(level: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/volume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async predictGesture(landmarks: LandmarkPoint[], triggerAction: boolean = false, sessionId: string = 'web_session'): Promise<GesturePrediction | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landmarks, trigger_action: triggerAction, session_id: sessionId }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getPresets(): Promise<Record<string, GesturePreset>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/presets`);
      if (!res.ok) return {};
      return await res.json();
    } catch {
      return {};
    }
  },

  async getModelInfo(): Promise<ModelMetrics | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/model-info`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async runBenchmark(suite: string = 'surgical', samplesPerGesture: number = 25): Promise<BenchmarkResult | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/benchmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suite, samples_per_gesture: samplesPerGesture }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getBenchmarksHistory(): Promise<BenchmarkResult[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/benchmarks/history`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getTelemetryHistory(): Promise<TelemetryLog[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/telemetry`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }
};

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectTimer: any = null;
  private onMessageCallback: ((data: any) => void) | null = null;
  private onStatusCallback: ((connected: boolean) => void) | null = null;
  public isConnected: boolean = false;

  constructor(url: string = WS_BASE_URL) {
    this.url = url;
  }

  connect(onMessage?: (data: any) => void, onStatusChange?: (connected: boolean) => void) {
    if (onMessage) this.onMessageCallback = onMessage;
    if (onStatusChange) this.onStatusCallback = onStatusChange;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        if (this.onStatusCallback) this.onStatusCallback(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessageCallback) this.onMessageCallback(data);
        } catch {}
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        if (this.onStatusCallback) this.onStatusCallback(false);
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.connect();
      }, 3000);
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  sendTelemetry(gesture: string, confidence: number, fingertip: { x: number; y: number }, metrics: any) {
    this.send({
      type: 'telemetry',
      gesture,
      confidence,
      fingertip,
      metrics
    });
  }

  sendEmergencyStop() {
    this.send({ type: 'emergency_stop' });
  }

  sendResume() {
    this.send({ type: 'resume_controls' });
  }

  sendAction(action: string, payload: any = {}) {
    this.send({
      type: 'execute_action',
      action,
      payload
    });
  }

  subscribe(callback: (data: any) => void) {
    this.onMessageCallback = callback;
    return () => {
      this.onMessageCallback = null;
    };
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const wsClient = new WebSocketClient();
