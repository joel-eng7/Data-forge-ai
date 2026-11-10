import React, { useState, useEffect, useCallback } from 'react';
import {
  Camera,
  Activity,
  Sliders,
  ShieldAlert,
  Sparkles,
  Volume2,
  Lock,
  Unlock,
  AlertCircle,
  HelpCircle,
  Zap,
  CheckCircle,
  Cpu,
  Monitor
} from 'lucide-react';
import WebcamView from '../dashboard/WebcamView';
import AIDetectionPanel from '../dashboard/AIDetectionPanel';
import ComputerControlPanel from '../dashboard/ComputerControlPanel';
import ActivityMonitor from '../dashboard/ActivityMonitor';
import EmergencyStopButton from '../dashboard/EmergencyStopButton';
import { useCamera } from '../dashboard/useCamera';
import { useHandDetection } from '../dashboard/useHandDetection';
import { api, wsClient, SystemSettings, ActivityLogItem } from '../services/api';

const DEFAULT_SETTINGS: SystemSettings = {
  mouse_enabled: true,
  click_enabled: true,
  right_click_enabled: true,
  scroll_enabled: true,
  volume_enabled: true,
  emergency_stopped: false,
  sensitivity: 1.35,
  cursor_speed: 1.25,
  click_delay: 0.35,
  scroll_speed: 1.0,
  volume_sensitivity: 1.0,
  left_handed_mode: false,
  enabled_gestures: {
    OPEN_PALM: true,
    INDEX_POINTING: true,
    PINCH: true,
    TWO_FINGER_PINCH: true,
    VICTORY: true,
    CLOSED_FIST: true,
    THUMBS_UP: true
  }
};

export default function DashboardPage() {
  // 1. Camera Hook
  const {
    videoRef,
    cameraStatus,
    errorMessage,
    devices,
    currentDeviceId,
    isMirrored,
    setIsMirrored,
    startCamera,
    stopCamera,
    switchCamera
  } = useCamera();

  // 2. Hand Detection & Gesture Classifier Hook
  const {
    modelStatus,
    modelError,
    landmarks,
    allHandsLandmarks,
    handCount,
    currentGesture,
    fps,
    latency,
    isDemoMode,
    setIsDemoMode,
    recentDetections
  } = useHandDetection(videoRef, cameraStatus, isMirrored);

  // 3. State Management
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('gestura_settings');
    if (saved) {
      try { return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }; } catch {}
    }
    return DEFAULT_SETTINGS;
  });

  const [isEmergencyStopped, setIsEmergencyStopped] = useState<boolean>(false);
  const [currentVolume, setCurrentVolume] = useState<number>(50);
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // 4. WebSocket Setup & Handshake
  useEffect(() => {
    wsClient.connect(
      (data: any) => {
        // Handle incoming WebSocket messages from Python backend
        if (data.type === 'handshake') {
          setIsBackendConnected(true);
          if (typeof data.volume === 'number') setCurrentVolume(data.volume);
          if (data.emergency_stopped !== undefined) setIsEmergencyStopped(data.emergency_stopped);
          if (data.config) {
            setSettings(prev => ({ ...prev, ...data.config }));
          }
        } else if (data.type === 'emergency_status') {
          setIsEmergencyStopped(data.emergency_stopped);
        } else if (data.type === 'action_result') {
          const entry: ActivityLogItem = {
            id: `${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            timestamp: data.timestamp || new Date().toLocaleTimeString(),
            action: data.action.toUpperCase(),
            details: data.details || '',
            success: data.success
          };
          setActivityLog(prev => [entry, ...prev.slice(0, 49)]);
        } else if (data.type === 'telemetry_ack') {
          if (data.action_executed) {
            const entry: ActivityLogItem = {
              id: `${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
              timestamp: new Date().toLocaleTimeString(),
              action: data.action_executed,
              details: `Gesture ${data.gesture} triggered`,
              success: data.action_success
            };
            setActivityLog(prev => [entry, ...prev.slice(0, 49)]);
          }
          if (data.recent_log && data.recent_log.length > 0) {
            setActivityLog(data.recent_log);
          }
        }
      },
      (connected: boolean) => {
        setIsBackendConnected(connected);
      }
    );

    // Initial polling check for backend status
    api.getStatus().then(status => {
      if (status) {
        setIsBackendConnected(true);
        setCurrentVolume(status.volume);
        setIsEmergencyStopped(status.emergency_stopped);
      }
    });

    return () => {
      wsClient.disconnect();
    };
  }, []);

  // Sync settings with localStorage and backend
  const handleUpdateSetting = useCallback(<K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('gestura_settings', JSON.stringify(updated));
      api.updateSettings({ [key]: value });
      return updated;
    });
  }, []);

  // Emergency Stop Handler
  const handleEmergencyStop = useCallback(async () => {
    setIsEmergencyStopped(true);
    wsClient.sendEmergencyStop();
    await api.triggerEmergencyStop();
    const entry: ActivityLogItem = {
      id: `${Date.now()}_stop`,
      timestamp: new Date().toLocaleTimeString(),
      action: 'EMERGENCY_STOP',
      details: 'Desktop controls disarmed. Mouse buttons released.',
      success: true
    };
    setActivityLog(prev => [entry, ...prev.slice(0, 49)]);
  }, []);

  // Resume Controls Handler
  const handleResume = useCallback(async () => {
    setIsEmergencyStopped(false);
    wsClient.sendResume();
    await api.resumeControls();
    const entry: ActivityLogItem = {
      id: `${Date.now()}_resume`,
      timestamp: new Date().toLocaleTimeString(),
      action: 'CONTROLS_RESUMED',
      details: 'Desktop gesture automation safely re-armed.',
      success: true
    };
    setActivityLog(prev => [entry, ...prev.slice(0, 49)]);
  }, []);

  // Volume Adjustment Handler
  const handleVolumeChange = useCallback(async (newVol: number) => {
    setCurrentVolume(newVol);
    wsClient.sendAction('volume', { level: newVol });
    api.setVolume(newVol);
  }, []);

  const handleClearLog = useCallback(() => {
    setActivityLog([]);
  }, []);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Welcome & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Control Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs">
              Live Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time hand landmark tracking and native desktop automation console.
          </p>
        </div>

        {/* Backend Connectivity Status Pill */}
        <div className="flex items-center gap-2.5">
          <div
            className={`px-3.5 py-2 rounded-2xl border backdrop-blur-md flex items-center gap-2 text-xs font-semibold shadow-xs ${
              isBackendConnected
                ? 'bg-emerald-50/90 text-emerald-700 border-emerald-300'
                : 'bg-amber-50/90 text-amber-700 border-amber-300'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>
              {isBackendConnected
                ? 'Python Backend Connected (:8000)'
                : 'Standalone Web Mode (Backend Standby)'}
            </span>
          </div>
        </div>
      </div>

      {/* Prominent Emergency Stop Component (Section 2.B.5) */}
      <EmergencyStopButton
        isEmergencyStopped={isEmergencyStopped}
        onEmergencyStop={handleEmergencyStop}
        onResume={handleResume}
      />

      {/* Main Grid: Left = Video & Activity Monitor, Right = AI Detection & Computer Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Webcam Preview + Activity Monitor */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Webcam Preview Component */}
          <WebcamView
            videoRef={videoRef}
            cameraStatus={cameraStatus}
            errorMessage={errorMessage}
            devices={devices}
            currentDeviceId={currentDeviceId}
            isMirrored={isMirrored}
            setIsMirrored={setIsMirrored}
            startCamera={startCamera}
            stopCamera={stopCamera}
            switchCamera={switchCamera}
            landmarks={landmarks}
            allHandsLandmarks={allHandsLandmarks}
            handCount={handCount}
            currentGesture={currentGesture}
            fps={fps}
            latency={latency}
            isDemoMode={isDemoMode}
            setIsDemoMode={setIsDemoMode}
            modelStatus={modelStatus}
          />

          {/* 4. Activity Monitor Component */}
          <ActivityMonitor
            activityLog={activityLog}
            onClearLog={handleClearLog}
            recentDetections={recentDetections}
          />
        </div>

        {/* Right Column (5 cols): AI Detection Panel + Computer Control Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* 2. AI Detection Panel */}
          <AIDetectionPanel
            currentGesture={currentGesture}
            handCount={handCount}
            fps={fps}
            latency={latency}
            modelStatus={modelStatus}
            isBackendConnected={isBackendConnected}
          />

          {/* 3. Computer Control Panel */}
          <ComputerControlPanel
            settings={settings}
            onUpdateSetting={handleUpdateSetting}
            currentVolume={currentVolume}
            onVolumeChange={handleVolumeChange}
            isBackendConnected={isBackendConnected}
          />
        </div>
      </div>
    </div>
  );
}
