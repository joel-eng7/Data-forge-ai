/**
 * GESTURA AI — Frontend API & WebSocket Service Layer
 * Fully typed client communicating with FastAPI backend.
 */

const API_BASE_URL = 'http://127.0.0.1:8000';
const WS_BASE_URL = 'ws://127.0.0.1:8000/ws';

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
  left_handed_mode: boolean;
  enabled_gestures: Record<string, boolean>;
  screen_width?: number;
  screen_height?: number;
  smoothing_factor?: number;
  platform?: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  success: boolean;
}

export const api = {
  async getStatus(): Promise<BackendStatus | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/status`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getSettings(): Promise<SystemSettings | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
        signal: AbortSignal.timeout(2000)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async triggerEmergencyStop(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/emergency-stop`, {
        method: 'POST',
        signal: AbortSignal.timeout(1500)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async resumeControls(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/resume`, {
        method: 'POST',
        signal: AbortSignal.timeout(1500)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getActivityLog(): Promise<ActivityLogItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/activity-log`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async setVolume(level: number): Promise<number | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/volume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
        signal: AbortSignal.timeout(1500)
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.volume;
    } catch {
      return null;
    }
  }
};

/**
 * WebSocket Client with auto-reconnect
 */
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

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        if (this.onStatusCallback) this.onStatusCallback(true);
        console.log('[GesturaWS] Connected to backend');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessageCallback) this.onMessageCallback(data);
        } catch (e) {
          console.error('[GesturaWS] Parse error:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        if (this.onStatusCallback) this.onStatusCallback(false);
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.isConnected = false;
        if (this.onStatusCallback) this.onStatusCallback(false);
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isConnected && this.onMessageCallback) {
        this.connect(this.onMessageCallback, this.onStatusCallback || undefined);
      }
    }, 2500);
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
