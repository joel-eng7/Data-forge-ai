import React, { useRef, useEffect, useState } from 'react';
import {
  Camera,
  CameraOff,
  FlipHorizontal,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  AlertCircle,
  Hash,
  Eye,
  EyeOff,
  Target,
  Volume2,
  VolumeX
} from 'lucide-react';
import { GestureResult } from './useHandDetection';
import { audioFeedback } from '../utils/audioFeedback';

export const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17]
];

interface WebcamViewProps {
  videoRef: any;
  cameraStatus: string;
  errorMessage: string | null;
  landmarks: Array<{ x: number; y: number; z: number }> | null;
  allHandsLandmarks: Array<Array<{ x: number; y: number; z: number }>> | null;
  currentGesture: GestureResult;
  fps: number;
  latency: number;
  isMirrored: boolean;
  setIsMirrored: React.Dispatch<React.SetStateAction<boolean>>;
  isDemoMode: boolean;
  setIsDemoMode: React.Dispatch<React.SetStateAction<boolean>>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  devices: any[];
  currentDeviceId: string;
  switchCamera: (deviceId: string) => Promise<void>;
  modelStatus?: string;
}

export default function WebcamView({
  videoRef,
  cameraStatus,
  errorMessage,
  landmarks,
  allHandsLandmarks,
  currentGesture,
  fps,
  latency,
  isMirrored,
  setIsMirrored,
  isDemoMode,
  setIsDemoMode,
  startCamera,
  stopCamera,
  devices,
  currentDeviceId,
  switchCamera,
  modelStatus
}: WebcamViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(audioFeedback.isMuted);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showLandmarkPoints, setShowLandmarkPoints] = useState(true);
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [showLandmarkLabels, setShowLandmarkLabels] = useState(false);

  // Play auditory click on gesture change
  useEffect(() => {
    if (currentGesture.gesture !== 'NO_HAND') {
      audioFeedback.playGestureSound(currentGesture.gesture);
    }
  }, [currentGesture.gesture]);

  const activeHands = allHandsLandmarks && allHandsLandmarks.length > 0
    ? allHandsLandmarks
    : landmarks
    ? [landmarks]
    : [];

  const handCount = activeHands.length;

  // Real-Time Canvas Rendering: 21 Landmarks + Cybernetic Yellow Bones & HUD
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (activeHands.length === 0) return;

    const w = canvas.width;
    const h = canvas.height;

    activeHands.forEach((hand) => {
      // Compute Bounding Box Coordinates
      let bMinX = w, bMaxX = 0, bMinY = h, bMaxY = 0;
      hand.forEach((lm) => {
        const x = (isMirrored ? 1 - lm.x : lm.x) * w;
        const y = lm.y * h;
        if (x < bMinX) bMinX = x;
        if (x > bMaxX) bMaxX = x;
        if (y < bMinY) bMinY = y;
        if (y > bMaxY) bMaxY = y;
      });

      // Add padding
      const pad = 24;
      bMinX = Math.max(0, bMinX - pad);
      bMaxX = Math.min(w, bMaxX + pad);
      bMinY = Math.max(0, bMinY - pad);
      bMaxY = Math.min(h, bMaxY + pad);
      const bW = bMaxX - bMinX;
      const bH = bMaxY - bMinY;

      // Draw Biometric Corner Brackets [ ]
      if (showBoundingBox) {
        const bracketLen = Math.min(22, bW * 0.2);
        ctx.save();
        ctx.strokeStyle = currentGesture.gesture === 'CLOSED_FIST' ? '#171717' : '#FFD633';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';

        // Top-Left
        ctx.beginPath();
        ctx.moveTo(bMinX, bMinY + bracketLen);
        ctx.lineTo(bMinX, bMinY);
        ctx.lineTo(bMinX + bracketLen, bMinY);
        ctx.stroke();

        // Top-Right
        ctx.beginPath();
        ctx.moveTo(bMaxX - bracketLen, bMinY);
        ctx.lineTo(bMaxX, bMinY);
        ctx.lineTo(bMaxX, bMinY + bracketLen);
        ctx.stroke();

        // Bottom-Left
        ctx.beginPath();
        ctx.moveTo(bMinX, bMaxY - bracketLen);
        ctx.lineTo(bMinX, bMaxY);
        ctx.lineTo(bMinX + bracketLen, bMaxY);
        ctx.stroke();

        // Bottom-Right
        ctx.beginPath();
        ctx.moveTo(bMaxX - bracketLen, bMaxY);
        ctx.lineTo(bMaxX, bMaxY);
        ctx.lineTo(bMaxX, bMaxY - bracketLen);
        ctx.stroke();

        // Tag Label
        ctx.fillStyle = '#FFD633';
        ctx.fillRect(bMinX, bMinY - 18, 95, 16);
        ctx.fillStyle = '#171717';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillText(`LOCKED ${currentGesture.confidence}%`, bMinX + 6, bMinY - 6);

        ctx.restore();
      }

      // 2. Draw Pinch Tension Line between Thumb Tip (4) and Index Tip (8)
      const pThumb = hand[4];
      const pIndex = hand[8];
      if (pThumb && pIndex) {
        const tx = (isMirrored ? 1 - pThumb.x : pThumb.x) * w;
        const ty = pThumb.y * h;
        const ix = (isMirrored ? 1 - pIndex.x : pIndex.x) * w;
        const iy = pIndex.y * h;
        const pinchDist = Math.hypot(tx - ix, ty - iy);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(ix, iy);
        const isPinching = currentGesture.gesture === 'PINCH';
        ctx.strokeStyle = isPinching ? '#FFD633' : pinchDist < 45 ? '#F5C21B' : 'rgba(255, 214, 51, 0.40)';
        ctx.lineWidth = isPinching ? 3 : 1.5;
        ctx.setLineDash(isPinching ? [] : [4, 4]);
        ctx.stroke();

        // Pinch trigger ripple
        if (isPinching) {
          const midX = (tx + ix) / 2;
          const midY = (ty + iy) / 2;
          ctx.beginPath();
          ctx.arc(midX, midY, 14, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 214, 51, 0.35)';
          ctx.fill();
        }
        ctx.restore();
      }

      // 3. Draw Skeleton Bones
      if (showSkeleton) {
        ctx.save();
        HAND_CONNECTIONS.forEach(([startIdx, endIdx]: [number, number]) => {
          const p1 = hand[startIdx];
          const p2 = hand[endIdx];
          if (!p1 || !p2) return;

          const x1 = (isMirrored ? 1 - p1.x : p1.x) * w;
          const y1 = p1.y * h;
          const x2 = (isMirrored ? 1 - p2.x : p2.x) * w;
          const y2 = p2.y * h;

          // Outer Glow
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineWidth = 4;
          ctx.strokeStyle = 'rgba(255, 214, 51, 0.35)';
          ctx.lineCap = 'round';
          ctx.stroke();

          // Inner Bright Line
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineCap = 'round';
          ctx.stroke();
        });
        ctx.restore();
      }

      // 4. Draw Landmark Nodes & Rings
      if (showLandmarkPoints) {
        hand.forEach((lm, idx) => {
          const x = (isMirrored ? 1 - lm.x : lm.x) * w;
          const y = lm.y * h;

          const isFingertip = idx in { 4: true, 8: true, 12: true, 16: true, 20: true };
          const isWrist = idx === 0;

          ctx.save();
          if (isFingertip) {
            // Glow aura
            ctx.beginPath();
            ctx.arc(x, y, 9, 0, Math.PI * 2);
            ctx.fillStyle = idx === 8 ? 'rgba(255, 214, 51, 0.55)' : 'rgba(245, 194, 27, 0.40)';
            ctx.fill();

            // Core
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = idx === 8 ? '#FFD633' : '#F5C21B';
            ctx.fill();
            ctx.lineWidth = 1.8;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
          } else if (isWrist) {
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#FFD633';
            ctx.fill();
            ctx.lineWidth = 1.8;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
          } else {
            // Joint
            ctx.beginPath();
            ctx.arc(x, y, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#FEF08A';
            ctx.fill();
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
          }

          if (showLandmarkLabels) {
            ctx.font = '9px JetBrains Mono, monospace';
            ctx.fillStyle = '#FFD633';
            ctx.fillText(`${idx}`, x + 6, y - 4);
          }
          ctx.restore();
        });
      }
    });
  }, [landmarks, allHandsLandmarks, isMirrored, showSkeleton, showLandmarkPoints, showBoundingBox, showLandmarkLabels, currentGesture]);

  const handleLoadedMetadata = () => {
    if (videoRef.current && canvasRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth || 640;
      canvasRef.current.height = videoRef.current.videoHeight || 480;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      }
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const isCameraActive = cameraStatus === 'active';

  return (
    <div
      ref={containerRef}
      className={`relative rounded-3xl overflow-hidden bg-white border border-gestura-border shadow-card-glass flex flex-col transition-all ${
        isFullscreen ? 'p-0 rounded-none fixed inset-0 z-50 bg-black' : ''
      }`}
    >
      {/* Video Preview Viewport */}
      <div className="relative w-full aspect-[4/3] sm:aspect-video bg-[#171717] flex items-center justify-center overflow-hidden">
        {/* Active Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={handleLoadedMetadata}
          className={`w-full h-full object-cover transition-transform duration-200 ${
            isMirrored ? '-scale-x-100' : ''
          } ${isCameraActive ? 'block' : 'hidden'}`}
        />

        {/* Real-Time Landmark Canvas Overlay */}
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
        />

        {/* Demo Mode Simulated Background */}
        {isDemoMode && !isCameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1C1A14] via-[#171717] to-[#121212] backdrop-blur-sm text-center p-6 z-0">
            <div className="w-16 h-16 rounded-2xl bg-gestura-yellow/20 border border-gestura-yellow/40 flex items-center justify-center mb-3 animate-pulse shadow-yellow-glow">
              <Sparkles className="w-8 h-8 text-gestura-yellow fill-gestura-yellow" />
            </div>
            <p className="text-gestura-yellow font-semibold text-lg">Interactive 3D Demo Stream</p>
            <p className="text-gray-300 text-sm max-w-sm mt-1">
              Simulating natural hand gestures and landmark tracking in real-time. Connect your webcam below for live camera control.
            </p>
          </div>
        )}

        {/* Idle / Camera Off State */}
        {!isCameraActive && !isDemoMode && (
          <div className="flex flex-col items-center justify-center text-center p-8 z-0">
            <div className="w-20 h-20 rounded-3xl bg-gestura-yellow/10 border border-gestura-yellow/30 flex items-center justify-center mb-4 text-gestura-yellow shadow-yellow-glow">
              <CameraOff className="w-10 h-10" />
            </div>
            <h3 className="text-white font-semibold text-xl">Camera is Paused</h3>
            <p className="text-gray-300 text-sm max-w-md mt-2 mb-6">
              Enable your webcam to start touchless hand gesture computer control, or launch Demo Mode to preview all 7 gestures immediately.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => startCamera()}
                className="px-6 py-2.5 rounded-xl bg-gestura-yellow hover:bg-gestura-yellowHover text-gestura-text font-bold shadow-yellow-subtle hover:shadow-yellow-glow active:scale-95 transition-all flex items-center gap-2"
              >
                <Camera className="w-4 h-4 text-gestura-text" />
                Enable Webcam
              </button>
              <button
                onClick={() => setIsDemoMode(true)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gestura-yellow border border-gestura-yellow/30 font-medium active:scale-95 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-gestura-yellow fill-gestura-yellow" />
                Launch Demo Mode
              </button>
            </div>
          </div>
        )}

        {/* Error State Banner */}
        {errorMessage && (
          <div className="absolute top-4 inset-x-4 bg-red-950/90 border border-red-500/60 rounded-2xl p-4 text-white backdrop-blur-md flex items-start gap-3 z-30 shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200">Camera Access Notice</p>
              <p className="mt-0.5 text-gray-200">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Top Control Overlay Pill Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border flex items-center gap-1.5 shadow-sm ${
                isCameraActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  : isDemoMode
                  ? 'bg-gestura-yellow/20 text-gestura-yellow border-gestura-yellow/40'
                  : 'bg-black/60 text-gray-300 border-gray-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isCameraActive ? 'bg-emerald-400 animate-ping' : isDemoMode ? 'bg-gestura-yellow' : 'bg-gray-400'
                }`}
              />
              {isCameraActive ? 'Live Camera Feed' : isDemoMode ? 'Simulated AI Demo' : 'Webcam Standby'}
            </span>

            {handCount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gestura-yellow text-gestura-text border border-gestura-yellowHover backdrop-blur-md">
                {handCount} Hand{handCount > 1 ? 's' : ''} Locked
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-black/60 text-gray-200 border border-white/10 backdrop-blur-md">
              {fps} FPS
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-black/60 text-gray-200 border border-white/10 backdrop-blur-md">
              {latency}ms
            </span>
            <button
              onClick={() => {
                const muted = audioFeedback.toggleMute();
                setIsAudioMuted(muted);
              }}
              className="p-1.5 rounded-full bg-black/60 text-gray-200 hover:text-white border border-white/10 backdrop-blur-md transition-all"
              title={isAudioMuted ? 'Unmute Audio Feedback' : 'Mute Audio Feedback'}
            >
              {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-gray-400" /> : <Volume2 className="w-3.5 h-3.5 text-gestura-yellow" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-full bg-black/60 text-gray-200 hover:text-white border border-white/10 backdrop-blur-md transition-all"
              title="Toggle Fullscreen Preview"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Floating Bottom Detected Gesture Bar */}
        {(isCameraActive || isDemoMode) && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3.5 rounded-2xl bg-white/95 border border-gestura-border shadow-card-glass backdrop-blur-md z-20">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-1.5 rounded-xl bg-gestura-goldLight border border-gestura-yellow/40 shadow-xs">
                {currentGesture.emoji}
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gestura-textMuted font-bold">Detected Gesture</p>
                <p className="text-sm sm:text-base font-bold text-gestura-text">
                  {currentGesture.name}
                </p>
                <p className="text-xs text-gestura-textMuted">
                  <span className="font-semibold text-gestura-text">Action:</span> {currentGesture.action}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-gestura-textMuted font-medium">Confidence Score</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-20 sm:w-28 h-2 rounded-full bg-gestura-surfaceAlt border border-gestura-border overflow-hidden">
                  <div
                    className="h-full bg-gestura-yellow transition-all duration-200 shadow-sm"
                    style={{ width: `${currentGesture.confidence}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-gestura-text">
                  {currentGesture.confidence}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Camera Toolbar Controls */}
      <div className="p-4 bg-white flex flex-wrap items-center justify-between gap-3 border-t border-gestura-border">
        <div className="flex items-center gap-2">
          {isCameraActive ? (
            <button
              onClick={stopCamera}
              className="px-4 py-2 rounded-xl bg-gestura-surface hover:bg-gestura-goldLight text-gestura-text text-xs font-bold border border-gestura-border flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
            >
              <CameraOff className="w-3.5 h-3.5 text-gestura-text" />
              Turn Off Camera
            </button>
          ) : (
            <button
              onClick={() => startCamera()}
              className="px-4 py-2 rounded-xl bg-gestura-yellow hover:bg-gestura-yellowHover text-gestura-text text-xs font-bold shadow-yellow-subtle flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Camera className="w-3.5 h-3.5 text-gestura-text" />
              Start Camera
            </button>
          )}

          <button
            onClick={() => setIsMirrored(prev => !prev)}
            className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
              isMirrored
                ? 'bg-gestura-goldLight border-gestura-yellow text-gestura-text font-bold shadow-xs'
                : 'bg-white border-gestura-border text-gestura-textMuted hover:bg-gestura-surface'
            }`}
            title="Mirror webcam preview horizontally"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            Mirror
          </button>

          <button
            onClick={() => setIsDemoMode(prev => !prev)}
            className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
              isDemoMode
                ? 'bg-gestura-goldLight border-gestura-yellow text-gestura-text font-bold shadow-xs'
                : 'bg-white border-gestura-border text-gestura-textMuted hover:bg-gestura-surface'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-gestura-text" />
            {isDemoMode ? 'Exit Demo' : 'Demo Stream'}
          </button>
        </div>

        {/* Overlay toggles */}
        <div className="flex items-center gap-2">
          {devices.length > 1 && (
            <select
              value={currentDeviceId}
              onChange={(e) => switchCamera(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl text-xs bg-white border border-gestura-border text-gestura-text font-medium focus:outline-none focus:ring-2 focus:ring-gestura-yellow"
            >
              {devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowBoundingBox(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all ${
              showBoundingBox ? 'bg-gestura-goldLight border-gestura-yellow text-gestura-text font-bold' : 'bg-white border-gestura-border text-gestura-textSubtle'
            }`}
            title="Toggle biometric bounding brackets"
          >
            <Target className="w-3.5 h-3.5" />
            HUD
          </button>

          <button
            onClick={() => setShowSkeleton(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all ${
              showSkeleton ? 'bg-gestura-goldLight border-gestura-yellow text-gestura-text font-bold' : 'bg-white border-gestura-border text-gestura-textSubtle'
            }`}
            title="Toggle hand bones skeleton"
          >
            <Layers className="w-3.5 h-3.5" />
            Skeleton
          </button>

          <button
            onClick={() => setShowLandmarkPoints(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all ${
              showLandmarkPoints ? 'bg-gestura-goldLight border-gestura-yellow text-gestura-text font-bold' : 'bg-white border-gestura-border text-gestura-textSubtle'
            }`}
            title="Toggle 21 landmark nodes"
          >
            {showLandmarkPoints ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Points
          </button>

          <button
            onClick={() => setShowLandmarkLabels(prev => !prev)}
            className={`px-2 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all ${
              showLandmarkLabels ? 'bg-gestura-goldLight border-gestura-yellow text-gestura-text font-bold' : 'bg-white border-gestura-border text-gestura-textSubtle'
            }`}
            title="Toggle landmark ID indices 0-20"
          >
            <Hash className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
