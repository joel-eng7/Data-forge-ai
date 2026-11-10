import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { useCamera } from './dashboard/useCamera';
import { useHandDetection } from './dashboard/useHandDetection';
import WebcamView from './dashboard/WebcamView';
import AIDetectionPanel from './dashboard/AIDetectionPanel';
import ComputerControlPanel from './dashboard/ComputerControlPanel';
import EmergencyStopButton from './dashboard/EmergencyStopButton';
import OverviewTab from './dashboard/OverviewTab';
import SimulatorTab from './dashboard/SimulatorTab';
import PlaygroundTab from './dashboard/PlaygroundTab';
import BenchmarksTab from './dashboard/BenchmarksTab';
import TransparencyTab from './dashboard/TransparencyTab';
import SettingsTab from './dashboard/SettingsTab';
import { api, SystemSettings } from './services/api';
import {
  LayoutDashboard,
  Camera,
  Layers,
  Target,
  Award,
  FileText,
  Sliders,
  Zap,
  ShieldAlert,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export type DashboardTab =
  | 'overview'
  | 'vision_studio'
  | 'simulator_3d'
  | 'playground'
  | 'benchmarks'
  | 'transparency'
  | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Backend System Settings
  const [settings, setSettings] = useState<SystemSettings>({
    screen_width: 1920,
    screen_height: 1080,
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
    smoothing_factor: 0.28,
    left_handed_mode: false,
    enabled_gestures: {
      OPEN_PALM: true,
      INDEX_POINTING: true,
      PINCH: true,
      TWO_FINGER_PINCH: true,
      VICTORY: true,
      CLOSED_FIST: true,
      THUMBS_UP: true
    },
    platform: 'macOS'
  });

  const [currentVolume, setCurrentVolume] = useState<number>(50);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(true);

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
    setIsDemoMode
  } = useHandDetection(videoRef, cameraStatus, isMirrored);

  // Poll backend health and settings
  useEffect(() => {
    api.getHealth().then((h) => setIsBackendHealthy(h !== null));
    api.getSettings().then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  // Update setting in local state & backend
  const handleUpdateSetting = async <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    await api.updateSettings({ [key]: value });
  };

  // Emergency Stop Handlers
  const handleEmergencyStop = async () => {
    setSettings((prev) => ({ ...prev, emergency_stopped: true }));
    await api.triggerEmergencyStop();
  };

  const handleResumeControls = async () => {
    setSettings((prev) => ({ ...prev, emergency_stopped: false }));
    await api.resumeControls();
  };

  // Dashboard Tabs definition
  const tabItems: Array<{ id: DashboardTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Console Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'vision_studio', label: 'AI Vision Studio', icon: <Camera className="w-4 h-4" /> },
    { id: 'simulator_3d', label: '3D Hand Simulator', icon: <Layers className="w-4 h-4" /> },
    { id: 'playground', label: 'Touchless Playground', icon: <Target className="w-4 h-4" /> },
    { id: 'benchmarks', label: 'Clinical Benchmarks', icon: <Award className="w-4 h-4" /> },
    { id: 'transparency', label: 'AI Architecture Audit', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: 'Calibration & Settings', icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F4] text-gestura-text font-sans antialiased flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isBackendHealthy={isBackendHealthy}
      />

      {/* Main Content Area */}
      {currentView === 'landing' ? (
        <LandingPage
          onEnterDashboard={(targetTab?: string) => {
            if (targetTab && tabItems.some((t) => t.id === targetTab)) {
              setActiveTab(targetTab as DashboardTab);
            }
            setCurrentView('dashboard');
          }}
        />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-6 flex-1">
          {/* Dashboard Tab Bar */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-gestura-border shadow-sm overflow-x-auto scrollbar-none">
            {tabItems.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap select-none ${
                    isActive
                      ? 'bg-gestura-yellow text-gestura-text shadow-yellow-subtle'
                      : 'text-gestura-textMuted hover:text-gestura-text hover:bg-gestura-surface'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Emergency Stop Failsafe Banner */}
          <EmergencyStopButton
            isEmergencyStopped={settings.emergency_stopped}
            onEmergencyStop={handleEmergencyStop}
            onResume={handleResumeControls}
          />

          {/* TAB 1: Console Overview */}
          {activeTab === 'overview' && (
            <OverviewTab
              onNavigateTab={(t) => setActiveTab(t)}
              currentGestureName={currentGesture.name}
              isTracking={handCount > 0}
            />
          )}

          {/* TAB 2: AI Vision Studio (Live Webcam & Skeleton Overlay) */}
          {activeTab === 'vision_studio' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Webcam Viewport (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
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
                  handCount={handCount}
                  currentGesture={currentGesture}
                  fps={fps}
                  latency={latency}
                  isDemoMode={isDemoMode}
                  setIsDemoMode={setIsDemoMode}
                  modelStatus={modelStatus}
                />
              </div>

              {/* AI Detection & Calibration Panels (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <AIDetectionPanel
                  currentGesture={currentGesture}
                  handCount={handCount}
                  fps={fps}
                  latency={latency}
                  modelStatus={modelStatus}
                  isBackendConnected={isBackendHealthy}
                />

                <ComputerControlPanel
                  settings={settings}
                  onUpdateSetting={handleUpdateSetting}
                  currentVolume={currentVolume}
                  onVolumeChange={setCurrentVolume}
                  isBackendConnected={isBackendHealthy}
                />
              </div>
            </div>
          )}

          {/* TAB 3: 3D Hand Simulator */}
          {activeTab === 'simulator_3d' && <SimulatorTab />}

          {/* TAB 4: Touchless Playground */}
          {activeTab === 'playground' && (
            <PlaygroundTab
              currentGesture={currentGesture.gesture}
              isTracking={handCount > 0}
            />
          )}

          {/* TAB 5: Clinical Benchmarks */}
          {activeTab === 'benchmarks' && <BenchmarksTab />}

          {/* TAB 6: AI Architecture Audit */}
          {activeTab === 'transparency' && <TransparencyTab />}

          {/* TAB 7: Calibration Settings */}
          {activeTab === 'settings' && <SettingsTab />}
        </main>
      )}
    </div>
  );
}
