import React, { useRef, useEffect, useState } from 'react';
import {
  Camera,
  CameraOff,
  FlipHorizontal,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  ShieldAlert,
  Layers,
  Activity,
  Zap
} from 'lucide-react';
import { Landmark, DetectedGestureState } from './useHandDetection';
import { CameraDevice, CameraStatus } from './useCamera';

interface WebcamViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraStatus: CameraStatus;
  errorMessage: string;
  devices: CameraDevice[];
  currentDeviceId: string;
  isMirrored: boolean;
  setIsMirrored: (val: boolean | ((prev: boolean) => boolean)) => void;
  startCamera: (devId?: string) => Promise<void>;
  stopCamera: () => void;
  switchCamera: (devId: string) => Promise<void>;
  landmarks: Landmark[] | null;
  allHandsLandmarks: Landmark[][];
  handCount: number;
  currentGesture: DetectedGestureState;
  fps: number;
  latency: number;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  modelStatus: string;
}

// MediaPipe 21 Hand Connections
const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17]
];

export default function WebcamView({
  videoRef,
  cameraStatus,
  errorMessage,
  devices,
  currentDeviceId,
  isMirrored,
  setIsMirrored,
  startCamera,
  stopCamera,
  switchCamera,
  landmarks,
  allHandsLandmarks,
  handCount,
  currentGesture,
  fps,
  latency,
  isDemoMode,
  setIsDemoMode,
  modelStatus
}: WebcamViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Visualization Toggles
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [showLandmarkPoints, setShowLandmarkPoints] = useState<boolean>(true);
  const [showBoundingBox, setShowBoundingBox] = useState<boolean>(true);

  // Synchronize Canvas with Video Resolution
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const handleLoadedMetadata = () => {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoRef]);

  // High-Performance 2D Skeleton Drawing Loop (Bright Yellow & Pure White)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks || landmarks.length < 21 || (!showSkeleton && !showLandmarkPoints)) return;

    const w = canvas.width;
    const h = canvas.height;

    const handsToRender = allHandsLandmarks.length > 0 ? allHandsLandmarks : [landmarks];

    handsToRender.forEach((hand) => {
      // 1. Draw Skeleton Bones
      if (showSkeleton) {
        ctx.save();
        HAND_CONNECTIONS.forEach(([i, j]) => {
          const p1 = hand[i];
          const p2 = hand[j];
          if (!p1 || !p2) return;

          const x1 = isMirrored ? (1 - p1.x) * w : p1.x * w;
          const y1 = p1.y * h;
          const x2 = isMirrored ? (1 - p2.x) * w : p2.x * w;
          const y2 = p2.y * h;

          // Outer Yellow Glow Bone
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = 'rgba(255, 214, 51, 0.65)';
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Inner Crisp White Bone
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
        ctx.restore();
      }

      // 2. Draw Landmark Joints
      if (showLandmarkPoints) {
        hand.forEach((lm, idx) => {
          const x = isMirrored ? (1 - lm.x) * w : lm.x * w;
          const y = lm.y * h;

          const isFingertip = [4, 8, 12, 16, 20].includes(idx);
          const isWrist = idx === 0;

          ctx.save();
          if (isFingertip) {
            // Fingertip Glowing Yellow Aura
            ctx.beginPath();
            ctx.arc(x, y, 9, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 214, 51, 0.45)';
            ctx.fill();

            // Core Dot
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#FFD633';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();
          } else if (isWrist) {
            // Wrist Marker
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, Math.PI * 2);
            ctx.fillStyle = '#171717';
            ctx.strokeStyle = '#FFD633';
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();
          } else {
            // Internal Phalangeal Nodes
            ctx.beginPath();
            ctx.arc(x, y, 3.8, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#FFD633';
            ctx.lineWidth = 1.5;
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();
        });
      }

      // 3. Draw Bounding Box & HUD
      if (showBoundingBox) {
        let minX = 1, maxX = 0, minY = 1, maxY = 0;
        hand.forEach(p => {
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        });

        const pad = 0.04;
        const bx = isMirrored ? (1 - Math.min(1, maxX + pad)) * w : Math.max(0, minX - pad) * w;
        const bw = Math.min(1, maxX - minX + pad * 2) * w;
        const by = Math.max(0, minY - pad) * h;
        const bh = Math.min(1, maxY - minY + pad * 2) * h;

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 214, 51, 0.85)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(bx, by, bw, bh);

        // Header Label Tag
        ctx.fillStyle = '#171717';
        ctx.fillRect(bx, Math.max(0, by - 22), 140, 22);

        ctx.fillStyle = '#FFD633';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillText(`${currentGesture.name.toUpperCase()} ${(currentGesture.confidence * 100).toFixed(0)}%`, bx + 6, Math.max(15, by - 7));
        ctx.restore();
      }
    });
  }, [landmarks, allHandsLandmarks, isMirrored, showSkeleton, showLandmarkPoints, showBoundingBox, currentGesture]);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Video Viewport Container */}
      <div
        ref={containerRef}
        className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#171717] border-2 border-gestura-border shadow-card-soft group"
      >
        {/* Hidden / Active Video Element */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover transition-transform duration-200 ${
            isMirrored ? 'scale-x-[-1]' : ''
          } ${cameraStatus === 'active' ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* 2D Skeletal Tracking Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* HUD Top Bar: Status, FPS, Latency */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-gestura-border text-[11px] font-mono font-bold text-gestura-text flex items-center gap-2 shadow-sm pointer-events-auto">
              <span className={`w-2 h-2 rounded-full ${cameraStatus === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              {cameraStatus === 'active' ? 'CAM LIVE' : 'CAM STANDBY'}
            </div>

            {cameraStatus === 'active' && (
              <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-mono font-medium text-white/90 flex items-center gap-3">
                <span className="text-gestura-yellow font-bold">{fps} FPS</span>
                <span className="text-white/60">|</span>
                <span>{latency} ms</span>
              </div>
            )}
          </div>

          {/* Quick HUD Controls */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={() => setIsMirrored(prev => !prev)}
              title="Mirror Camera Feed"
              className="p-2 rounded-xl bg-white/90 hover:bg-white text-gestura-text border border-gestura-border shadow-sm transition-all active:scale-95"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSkeleton(prev => !prev)}
              title={showSkeleton ? "Hide Kinematic Skeleton" : "Show Kinematic Skeleton"}
              className={`p-2 rounded-xl border shadow-sm transition-all active:scale-95 ${
                showSkeleton ? 'bg-gestura-yellow text-gestura-text border-gestura-yellow' : 'bg-white/90 text-gestura-textSubtle border-gestura-border'
              }`}
            >
              {showSkeleton ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Active Gesture Overlay Pill (Floating Bottom Left) */}
        {cameraStatus === 'active' && handCount > 0 && (
          <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
            <div className="px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-gestura-yellow/40 shadow-yellow-subtle flex items-center gap-3">
              <span className="text-2xl">{currentGesture.emoji}</span>
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-gestura-textSubtle">
                  Detected Intent
                </div>
                <div className="font-display font-bold text-gestura-text text-sm flex items-center gap-2">
                  {currentGesture.name}
                  <span className="px-1.5 py-0.5 rounded-md bg-gestura-goldLight text-gestura-text font-mono text-[10px] border border-gestura-yellow/30">
                    {(currentGesture.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty / Error / Inactive States */}
        {cameraStatus !== 'active' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-[#FAF9F4]/95 backdrop-blur-sm">
            <div className="w-14 h-14 rounded-2xl bg-gestura-goldLight border border-gestura-yellow/50 flex items-center justify-center mb-3 shadow-yellow-subtle">
              <Camera className="w-7 h-7 text-gestura-text" />
            </div>

            <h3 className="font-display font-bold text-gestura-text text-lg mb-1">
              {cameraStatus === 'requesting' ? 'Requesting Camera Access...' : 'Optical Camera Feed Standby'}
            </h3>
            <p className="text-xs text-gestura-textMuted max-w-sm mb-4">
              {errorMessage || 'Enable your optical webcam to track 21 hand landmarks in real-time with sub-12ms AI inference.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => startCamera()}
                disabled={cameraStatus === 'requesting'}
                className="px-5 py-2.5 rounded-xl bg-gestura-yellow hover:bg-gestura-yellowHover text-gestura-text font-bold text-sm shadow-yellow-subtle hover:shadow-yellow-glow transition-all active:scale-95 flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                {cameraStatus === 'requesting' ? 'Connecting...' : 'Start Camera Feed'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Camera Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-gestura-border shadow-sm">
        <div className="flex items-center gap-2">
          {cameraStatus === 'active' ? (
            <button
              onClick={stopCamera}
              className="px-3.5 py-1.5 rounded-lg bg-gestura-surface hover:bg-rose-50 hover:text-rose-600 text-gestura-text font-medium text-xs border border-gestura-border transition-colors flex items-center gap-1.5"
            >
              <CameraOff className="w-3.5 h-3.5" />
              Stop Camera
            </button>
          ) : (
            <button
              onClick={() => startCamera()}
              className="px-3.5 py-1.5 rounded-lg bg-gestura-yellow hover:bg-gestura-yellowHover text-gestura-text font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              Start Camera
            </button>
          )}

          {devices.length > 1 && (
            <select
              value={currentDeviceId}
              onChange={(e) => switchCamera(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-gestura-surface text-gestura-text text-xs border border-gestura-border focus:outline-none focus:border-gestura-yellow"
            >
              {devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-gestura-textMuted">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-gestura-yellow" />
            MediaPipe Vision 21 Landmarks
          </span>
        </div>
      </div>
    </div>
  );
}
