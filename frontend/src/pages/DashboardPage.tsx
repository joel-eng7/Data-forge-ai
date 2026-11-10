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
  Monitor,
  Target,
  Scan,
  Layers,
  ArrowRight,
  Crosshair,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import WebcamView from '../dashboard/WebcamView';
import AIDetectionPanel from '../dashboard/AIDetectionPanel';
import ComputerControlPanel from '../dashboard/ComputerControlPanel';
import ActivityMonitor from '../dashboard/ActivityMonitor';
import EmergencyStopButton from '../dashboard/EmergencyStopButton';
import TouchlessPlayground from '../dashboard/TouchlessPlayground';
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
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  const [currentVolume, setCurrentVolume] = useState<number>(50);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState<boolean>(false);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState<boolean>(false);
  const [calibrationStep, setCalibrationStep] = useState<number>(1);

  // Optical Camera Hook
  const {
    videoRef,
    cameraStatus,
    errorMessage: cameraError,
    devices,
    currentDeviceId,
    isMirrored,
    setIsMirrored,
    startCamera,
    stopCamera,
    switchCamera
  } = useCamera();

  // AI Hand Detection Pipeline Hook
  const {
    modelStatus,
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

  // Poll backend health and settings
  const fetchBackendData = useCallback(async () => {
    try {
      const statusData = await api.getStatus();
      if (statusData) {
        setIsBackendConnected(true);
        setCurrentVolume(statusData.volume || 50);
        setSettings((prev) => ({
          ...prev,
          emergency_stopped: statusData.emergency_stopped,
          mouse_enabled: statusData.controls.mouse,
          click_enabled: statusData.controls.click,
          right_click_enabled: statusData.controls.right_click,
          scroll_enabled: statusData.controls.scroll,
          volume_enabled: statusData.controls.volume,
          screen_width: statusData.screen.width,
          screen_height: statusData.screen.height
        }));
      } else {
        setIsBackendConnected(false);
      }

      const logs = await api.getActivityLog();
      if (logs) setActivityLog(logs);
    } catch {
      setIsBackendConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchBackendData();
    const interval = setInterval(fetchBackendData, 3000);

    // Initialize WebSocket connection
    wsClient.connect(
      (data: any) => {
        if (data.type === 'action_result') {
          setActivityLog((prev) => [
            {
              id: `${Date.now()}`,
              timestamp: data.timestamp || new Date().toLocaleTimeString(),
              action: data.action.toUpperCase(),
              details: data.details || '',
              success: Boolean(data.success)
            },
            ...prev.slice(0, 49)
          ]);
        }
      },
      (connected: boolean) => {
        setIsBackendConnected(connected);
      }
    );

    return () => {
      clearInterval(interval);
      wsClient.disconnect();
    };
  }, [fetchBackendData]);

  // Update Settings Handler
  const handleUpdateSetting = async <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    try {
      await api.updateSettings({ [key]: value });
    } catch (e) {
      console.error('Failed to update setting:', e);
    }
  };

  // Emergency Safe Stop
  const handleEmergencyStop = async () => {
    setSettings((prev) => ({ ...prev, emergency_stopped: true }));
    wsClient.sendEmergencyStop();
    await api.triggerEmergencyStop();
    setActivityLog((prev) => [
      {
        id: `${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        action: 'EMERGENCY_STOP',
        details: 'All desktop mouse and click events disarmed safely.',
        success: true
      },
      ...prev
    ]);
  };

  // Resume Controls
  const handleResume = async () => {
    setSettings((prev) => ({ ...prev, emergency_stopped: false }));
    wsClient.sendResume();
    await api.resumeControls();
    setActivityLog((prev) => [
      {
        id: `${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        action: 'CONTROLS_RESUMED',
        details: 'Spatial desktop controls re-armed.',
        success: true
      },
      ...prev
    ]);
  };

  // Change Volume
  const handleVolumeChange = async (newVol: number) => {
    setCurrentVolume(newVol);
    wsClient.sendAction('volume', { level: newVol });
    await api.setVolume(newVol);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 text-gestura-text">
      {/* Top Console Status Bar */}
      <div className="rounded-3xl p-6 bg-white border border-gestura-border shadow-card-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-gestura-goldLight text-gestura-text font-mono text-[11px] font-bold border border-gestura-yellow/40">
              OPERATIONAL DASHBOARD
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              isBackendConnected ? 'bg-gestura-yellow/30 text-gestura-text border border-gestura-yellow/50' : 'bg-gray-100 text-gray-700'
            }`}>
              {isBackendConnected ? 'Daemon Synced (Port 8000)' : 'Offline / Standalone Web'}
            </span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-gestura-text">
            Intelligent Gesture Control Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-gestura-textMuted max-w-2xl mt-0.5">
            Real-time hand tracking, 21-point biomechanical skeleton extraction, and computer control execution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Practice Arena Toggle */}
          <button
            onClick={() => setIsPlaygroundOpen(!isPlaygroundOpen)}
            className={`px-4 py-2 rounded-xl font-bold text-xs font-mono border transition-all flex items-center gap-1.5 shadow-xs ${
              isPlaygroundOpen
                ? 'bg-gestura-yellow text-gestura-text border-gestura-yellowHover shadow-yellow-subtle'
                : 'bg-gestura-surface hover:bg-gestura-goldLight text-gestura-text border-gestura-border'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            {isPlaygroundOpen ? 'Close Practice Arena' : 'Practice Arena'}
          </button>

          {/* Screen Calibration Button */}
          <button
            onClick={() => {
              setCalibrationStep(1);
              setIsCalibrationOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-white hover:bg-gestura-goldLight text-gestura-text font-bold text-xs font-mono border border-gestura-border transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Crosshair className="w-3.5 h-3.5 text-gestura-text" />
            Screen Calibration
          </button>

          <Link
            to="/gestures"
            className="px-4 py-2 rounded-xl bg-white hover:bg-gestura-goldLight text-gestura-text font-bold text-xs font-mono border border-gestura-border transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 text-gestura-text" />
            3D Library
          </Link>

          <button
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className="p-2 rounded-xl bg-white hover:bg-gestura-goldLight text-gestura-text border border-gestura-border transition-all shadow-xs"
            title="Help / Keyboard Reference"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Emergency Safe Stop Failsafe Banner */}
      <EmergencyStopButton
        isEmergencyStopped={Boolean(settings.emergency_stopped)}
        onEmergencyStop={handleEmergencyStop}
        onResume={handleResume}
      />

      {/* Touchless Practice Arena (Target Bubble Popping) */}
      {isPlaygroundOpen && (
        <TouchlessPlayground
          currentGesture={currentGesture.gesture}
          isConfirmed={Boolean(currentGesture.isConfirmed)}
          fingertip={currentGesture.metrics.fingertip}
          onClose={() => setIsPlaygroundOpen(false)}
        />
      )}

      {/* 4-Corner Screen Calibration Modal */}
      {isCalibrationOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border-2 border-gestura-border shadow-card-glass space-y-5 relative">
            <button
              onClick={() => setIsCalibrationOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-gestura-textSubtle hover:text-gestura-text hover:bg-gestura-surface"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-gestura-border">
              <div className="w-10 h-10 rounded-xl bg-gestura-goldLight text-gestura-text flex items-center justify-center border border-gestura-yellow/40">
                <Crosshair className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-gestura-text text-lg">
                  Screen Boundary Calibration
                </h3>
                <p className="text-xs text-gestura-textMuted">
                  Step {calibrationStep} of 4: Calibrating active tracking zone
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-gestura-textMuted leading-relaxed">
              <p>
                Point your index finger toward the{' '}
                <strong className="text-gestura-text">
                  {calibrationStep === 1 && 'TOP-LEFT corner'}
                  {calibrationStep === 2 && 'TOP-RIGHT corner'}
                  {calibrationStep === 3 && 'BOTTOM-RIGHT corner'}
                  {calibrationStep === 4 && 'BOTTOM-LEFT corner'}
                </strong>{' '}
                of your webcam viewport and pinch or tap Continue to register the coordinates.
              </p>

              {/* Progress Tracker */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`p-2 rounded-xl text-center font-mono font-bold text-[11px] border ${
                      step === calibrationStep
                        ? 'bg-gestura-yellow text-gestura-text border-gestura-yellowHover shadow-sm'
                        : step < calibrationStep
                        ? 'bg-gestura-goldLight text-gestura-text border-gestura-yellow/40'
                        : 'bg-gestura-surface text-gestura-textSubtle border-gestura-border'
                    }`}
                  >
                    Point {step}
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-2xl bg-gestura-surface border border-gestura-border font-mono text-[11px] space-y-1">
                <div>Current Fingertip: ({(currentGesture.metrics.fingertip.x * 100).toFixed(1)}%, {(currentGesture.metrics.fingertip.y * 100).toFixed(1)}%)</div>
                <div>Detected Gesture: <span className="font-bold text-gestura-text">[{currentGesture.gesture}]</span></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gestura-border">
              <button
                onClick={() => setIsCalibrationOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gestura-textMuted hover:bg-gestura-surface"
              >
                Cancel
              </button>
              {calibrationStep < 4 ? (
                <button
                  onClick={() => setCalibrationStep(s => s + 1)}
                  className="px-5 py-2.5 rounded-xl bg-gestura-yellow hover:bg-gestura-yellowHover text-gestura-text font-bold text-xs shadow-yellow-subtle"
                >
                  Confirm Point {calibrationStep} &rarr;
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsCalibrationOpen(false);
                    setActivityLog(prev => [
                      {
                        id: `${Date.now()}`,
                        timestamp: new Date().toLocaleTimeString(),
                        action: 'CALIBRATION_SAVED',
                        details: '4-Point screen boundaries calibrated successfully.',
                        success: true
                      },
                      ...prev
                    ]);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gestura-yellow hover:bg-gestura-yellowHover text-gestura-text font-bold text-xs shadow-yellow-subtle"
                >
                  Finish Calibration
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Help Modal/Banner */}
      {isHelpOpen && (
        <div className="p-5 rounded-2xl bg-gestura-goldLight/70 border border-gestura-yellow/50 text-xs font-mono text-gestura-text flex items-start justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider block text-sm text-gestura-text">
              Quick Gesture Shortcut Card
            </span>
            <p className="text-gestura-textMuted">
              <strong className="text-gestura-text">Index Pointing</strong> = Move Pointer &bull; <strong className="text-gestura-text">Pinch (Thumb+Index)</strong> = Left Click &bull; <strong className="text-gestura-text">Two-Finger Pinch</strong> = Right Click &bull; <strong className="text-gestura-text">Victory (2 Fingers)</strong> = Vertical Scroll &bull; <strong className="text-gestura-text">Closed Fist</strong> = Safe Stop &bull; <strong className="text-gestura-text">Open Palm</strong> = Steady Mode
            </p>
          </div>
          <button
            onClick={() => setIsHelpOpen(false)}
            className="px-2.5 py-1 rounded-lg bg-white text-gestura-text border border-gestura-border font-bold text-xs hover:bg-gestura-goldLight shadow-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main 2-Column Split: Viewport (7 cols) + AI & Controls (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Optical Video & Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <WebcamView
            videoRef={videoRef}
            cameraStatus={cameraStatus}
            errorMessage={cameraError}
            devices={devices}
            currentDeviceId={currentDeviceId}
            isMirrored={isMirrored}
            setIsMirrored={setIsMirrored}
            startCamera={startCamera}
            stopCamera={stopCamera}
            switchCamera={switchCamera}
            landmarks={landmarks}
            allHandsLandmarks={allHandsLandmarks}
            currentGesture={currentGesture}
            fps={fps}
            latency={latency}
            isDemoMode={isDemoMode}
            setIsDemoMode={setIsDemoMode}
            modelStatus={modelStatus}
          />

          {/* Activity Audit Log */}
          <ActivityMonitor
            activityLog={activityLog}
            onClearLog={() => setActivityLog([])}
            recentDetections={recentDetections}
          />
        </div>

        {/* Right Column: AI Detection Gauge & Kinematic Sliders (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <AIDetectionPanel
            currentGesture={currentGesture}
            handCount={handCount}
            fps={fps}
            latency={latency}
            modelStatus={modelStatus}
            isBackendConnected={isBackendConnected}
          />

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
