import { useState, useEffect, useRef, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { GESTURE_DEFINITIONS, GestureDefinition } from '../gestures/gestureDefinitions';
import { wsClient } from '../services/api';

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface DetectedGestureState {
  gesture: string;
  name: string;
  action: string;
  emoji: string;
  color: string;
  confidence: number;
  fingerStates: { thumb: boolean; index: boolean; middle: boolean; ring: boolean; pinky: boolean };
  metrics: {
    pinchDistance: number;
    twoFingerPinchDistance: number;
    scrollDeltaY: number;
    fingertip: { x: number; y: number };
  };
  isConfirmed: boolean;
}

export function useHandDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  cameraStatus: string,
  isMirrored: boolean = true
) {
  const [modelStatus, setModelStatus] = useState<'uninitialized' | 'loading' | 'ready' | 'error'>('uninitialized');
  const [modelError, setModelError] = useState<string>('');
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);
  const [allHandsLandmarks, setAllHandsLandmarks] = useState<Landmark[][]>([]);
  const [handCount, setHandCount] = useState<number>(0);

  const [currentGesture, setCurrentGesture] = useState<DetectedGestureState>({
    gesture: 'NO_HAND',
    name: 'No Hand Detected',
    action: 'None',
    emoji: '✋🏻',
    color: '#94A3B8',
    confidence: 0,
    fingerStates: { thumb: false, index: false, middle: false, ring: false, pinky: false },
    metrics: { pinchDistance: 1, twoFingerPinchDistance: 1, scrollDeltaY: 0, fingertip: { x: 0.5, y: 0.5 } },
    isConfirmed: false
  });

  const [fps, setFps] = useState<number>(0);
  const [latency, setLatency] = useState<number>(0);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [recentDetections, setRecentDetections] = useState<Array<{ id: string; gesture: string; name: string; timestamp: string; confidence: number }>>([]);

  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const fpsTimestampsRef = useRef<number[]>([]);
  const historyRef = useRef<string[]>([]);
  const prevTipYRef = useRef<number | null>(null);
  const demoCycleRef = useRef<{ index: number; timer: number }>({ index: 0, timer: Date.now() });

  // 1. Initialize MediaPipe HandLandmarker
  useEffect(() => {
    let isMounted = true;

    async function initModel() {
      setModelStatus('loading');
      try {
        let vision;
        try {
          vision = await FilesetResolver.forVisionTasks('/wasm');
        } catch (wasmErr) {
          console.warn('Local WASM fallback to CDN:', wasmErr);
          vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm'
          );
        }

        if (!isMounted) return;

        let landmarker;
        try {
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: '/models/hand_landmarker.task',
              delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numHands: 2
          });
        } catch (gpuErr) {
          console.warn('Local or GPU task load error, falling back to CPU / CDN model:', gpuErr);
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'CPU'
            },
            runningMode: 'VIDEO',
            numHands: 2
          });
        }

        if (!isMounted) {
          landmarker?.close();
          return;
        }

        landmarkerRef.current = landmarker;
        setModelStatus('ready');
      } catch (err: any) {
        console.error('HandLandmarker init error:', err);
        if (isMounted) {
          setModelStatus('error');
          setModelError(err.message || 'Failed to initialize hand landmarker model.');
        }
      }
    }

    initModel();

    return () => {
      isMounted = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, []);

  // 2. Geometric Classification Algorithm
  const classifyLandmarks = useCallback((pts: Landmark[], mirrored: boolean): DetectedGestureState => {
    if (!pts || pts.length < 21) {
      return {
        gesture: 'NO_HAND',
        name: 'No Hand Detected',
        action: 'None',
        emoji: '✋🏻',
        color: '#94A3B8',
        confidence: 0,
        fingerStates: { thumb: false, index: false, middle: false, ring: false, pinky: false },
        metrics: { pinchDistance: 1, twoFingerPinchDistance: 1, scrollDeltaY: 0, fingertip: { x: 0.5, y: 0.5 } },
        isConfirmed: false
      };
    }

    const wrist = pts[0];
    const thumbTip = pts[4];
    const thumbIp = pts[3];
    const thumbMcp = pts[2];

    const indexMcp = pts[5];
    const indexPip = pts[6];
    const indexTip = pts[8];

    const middleMcp = pts[9];
    const middlePip = pts[10];
    const middleTip = pts[12];

    const ringMcp = pts[13];
    const ringPip = pts[14];
    const ringTip = pts[16];

    const pinkyMcp = pts[17];
    const pinkyPip = pts[18];
    const pinkyTip = pts[20];

    // Hand scale normalization
    const scale = Math.hypot(wrist.x - middleMcp.x, wrist.y - middleMcp.y) || 1.0;

    // Finger extensions
    const indexExtended = indexTip.y < indexPip.y && indexTip.y < indexMcp.y;
    const middleExtended = middleTip.y < middlePip.y && middleTip.y < middleMcp.y;
    const ringExtended = ringTip.y < ringPip.y && ringTip.y < ringMcp.y;
    const pinkyExtended = pinkyTip.y < pinkyPip.y && pinkyTip.y < pinkyMcp.y;

    // Thumb extension
    const distThumbWrist = Math.hypot(thumbTip.x - wrist.x, thumbTip.y - wrist.y);
    const distThumbMcpWrist = Math.hypot(thumbMcp.x - wrist.x, thumbMcp.y - wrist.y);
    const thumbExtended = distThumbWrist > distThumbMcpWrist * 1.25;

    const fingerStates = {
      thumb: thumbExtended,
      index: indexExtended,
      middle: middleExtended,
      ring: ringExtended,
      pinky: pinkyExtended
    };

    // Euclidean Distances
    const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y) / scale;
    const twoFingerPinchDist = Math.hypot(thumbTip.x - middleTip.x, thumbTip.y - middleTip.y) / scale;

    // Upward thumb check for Thumbs Up
    const thumbUpward = thumbTip.y < thumbIp.y && thumbTip.y < wrist.y - (0.2 * scale);
    const otherFingersCurled = !indexExtended && !middleExtended && !ringExtended && !pinkyExtended;

    // Scroll vertical delta
    let scrollDeltaY = 0;
    if (prevTipYRef.current !== null) {
      scrollDeltaY = prevTipYRef.current - indexTip.y; // Positive if moving upwards
    }
    prevTipYRef.current = indexTip.y;

    // Effective normalized fingertip (accounting for mirror)
    const effectiveFingertip = {
      x: mirrored ? 1.0 - indexTip.x : indexTip.x,
      y: indexTip.y
    };

    let gestureId = 'NO_HAND';
    let confidence = 0.70;

    // 1. Closed Fist: all fingers curled
    if (otherFingersCurled && !thumbExtended) {
      gestureId = 'CLOSED_FIST';
      confidence = 0.95;
    }
    // 2. Thumbs Up
    else if (thumbUpward && otherFingersCurled) {
      gestureId = 'THUMBS_UP';
      confidence = 0.96;
    }
    // 3. Pinch (Thumb + Index): Left click
    else if (pinchDist < 0.28 && !middleExtended && !ringExtended) {
      gestureId = 'PINCH';
      confidence = Math.max(0.75, 1.0 - pinchDist * 2);
    }
    // 4. Two-Finger Pinch (Thumb + Middle): Right click
    else if (twoFingerPinchDist < 0.28 && !ringExtended && !pinkyExtended) {
      gestureId = 'TWO_FINGER_PINCH';
      confidence = Math.max(0.75, 1.0 - twoFingerPinchDist * 2);
    }
    // 5. Two-Finger Victory: Scroll mode
    else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      gestureId = 'VICTORY';
      confidence = 0.93;
    }
    // 6. Index Pointing: Move cursor
    else if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      gestureId = 'INDEX_POINTING';
      confidence = 0.95;
    }
    // 7. Open Palm: All fingers extended
    else if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
      gestureId = 'OPEN_PALM';
      confidence = 0.94;
    } else {
      gestureId = indexExtended && middleExtended ? 'OPEN_PALM' : 'NO_HAND';
      confidence = 0.65;
    }

    // Temporal Smoothing (Hysteresis)
    historyRef.current.push(gestureId);
    if (historyRef.current.length > 5) historyRef.current.shift();

    const counts: Record<string, number> = {};
    historyRef.current.forEach(g => { counts[g] = (counts[g] || 0) + 1; });
    const mostFrequent = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, gestureId);
    const isConfirmed = (counts[mostFrequent] || 0) >= 3;

    const confirmedId = isConfirmed ? mostFrequent : gestureId;
    const meta = GESTURE_DEFINITIONS[confirmedId] || {
      name: 'No Hand',
      action: 'None',
      emoji: '✋🏻',
      color: '#94A3B8'
    };

    return {
      gesture: confirmedId,
      name: meta.name,
      action: meta.action,
      emoji: meta.emoji,
      color: meta.color,
      confidence: Math.round(confidence * 100),
      fingerStates,
      metrics: {
        pinchDistance: Number(pinchDist.toFixed(3)),
        twoFingerPinchDistance: Number(twoFingerPinchDist.toFixed(3)),
        scrollDeltaY: Number(scrollDeltaY.toFixed(4)),
        fingertip: effectiveFingertip
      },
      isConfirmed
    };
  }, []);

  // 3. Demo Hand Simulation Generator
  const generateDemoHand = useCallback((timestamp: number): Landmark[] => {
    const gestures = ['OPEN_PALM', 'INDEX_POINTING', 'PINCH', 'VICTORY', 'CLOSED_FIST', 'THUMBS_UP', 'TWO_FINGER_PINCH'];
    const now = Date.now();
    if (now - demoCycleRef.current.timer > 3500) {
      demoCycleRef.current.index = (demoCycleRef.current.index + 1) % gestures.length;
      demoCycleRef.current.timer = now;
    }
    const currentSimGesture = gestures[demoCycleRef.current.index];

    // Base hand geometry centered at 0.5, 0.5
    const wobbleX = Math.sin(timestamp * 0.002) * 0.04;
    const wobbleY = Math.cos(timestamp * 0.0015) * 0.03;

    const baseHand: Landmark[] = [
      { x: 0.5 + wobbleX, y: 0.75 + wobbleY, z: 0 }, // 0: wrist
      { x: 0.44 + wobbleX, y: 0.68 + wobbleY, z: -0.01 }, // 1: thumb cmc
      { x: 0.40 + wobbleX, y: 0.60 + wobbleY, z: -0.02 }, // 2: thumb mcp
      { x: 0.38 + wobbleX, y: 0.52 + wobbleY, z: -0.03 }, // 3: thumb ip
      { x: 0.36 + wobbleX, y: 0.45 + wobbleY, z: -0.04 }, // 4: thumb tip
      { x: 0.46 + wobbleX, y: 0.52 + wobbleY, z: -0.01 }, // 5: index mcp
      { x: 0.46 + wobbleX, y: 0.42 + wobbleY, z: -0.02 }, // 6: index pip
      { x: 0.46 + wobbleX, y: 0.35 + wobbleY, z: -0.03 }, // 7: index dip
      { x: 0.46 + wobbleX, y: 0.28 + wobbleY, z: -0.04 }, // 8: index tip
      { x: 0.50 + wobbleX, y: 0.51 + wobbleY, z: 0 }, // 9: middle mcp
      { x: 0.50 + wobbleX, y: 0.40 + wobbleY, z: -0.01 }, // 10: middle pip
      { x: 0.50 + wobbleX, y: 0.32 + wobbleY, z: -0.02 }, // 11: middle dip
      { x: 0.50 + wobbleX, y: 0.25 + wobbleY, z: -0.03 }, // 12: middle tip
      { x: 0.54 + wobbleX, y: 0.53 + wobbleY, z: 0.01 }, // 13: ring mcp
      { x: 0.54 + wobbleX, y: 0.43 + wobbleY, z: 0 }, // 14: ring pip
      { x: 0.54 + wobbleX, y: 0.36 + wobbleY, z: -0.01 }, // 15: ring dip
      { x: 0.54 + wobbleX, y: 0.30 + wobbleY, z: -0.02 }, // 16: ring tip
      { x: 0.58 + wobbleX, y: 0.56 + wobbleY, z: 0.02 }, // 17: pinky mcp
      { x: 0.58 + wobbleX, y: 0.48 + wobbleY, z: 0.01 }, // 18: pinky pip
      { x: 0.58 + wobbleX, y: 0.42 + wobbleY, z: 0 }, // 19: pinky dip
      { x: 0.58 + wobbleX, y: 0.36 + wobbleY, z: -0.01 } // 20: pinky tip
    ];

    // Morph coordinates to fit simulated gesture
    if (currentSimGesture === 'INDEX_POINTING') {
      baseHand[12].y = 0.58 + wobbleY;
      baseHand[16].y = 0.59 + wobbleY;
      baseHand[20].y = 0.60 + wobbleY;
    } else if (currentSimGesture === 'PINCH') {
      baseHand[4] = { x: 0.45 + wobbleX, y: 0.38 + wobbleY, z: -0.02 };
      baseHand[8] = { x: 0.46 + wobbleX, y: 0.38 + wobbleY, z: -0.02 };
      baseHand[12].y = 0.58 + wobbleY;
      baseHand[16].y = 0.59 + wobbleY;
      baseHand[20].y = 0.60 + wobbleY;
    } else if (currentSimGesture === 'VICTORY') {
      baseHand[8] = { x: 0.43 + wobbleX, y: 0.26 + wobbleY, z: -0.04 };
      baseHand[12] = { x: 0.53 + wobbleX, y: 0.25 + wobbleY, z: -0.03 };
      baseHand[16].y = 0.59 + wobbleY;
      baseHand[20].y = 0.60 + wobbleY;
    } else if (currentSimGesture === 'CLOSED_FIST') {
      baseHand[4] = { x: 0.45 + wobbleX, y: 0.55 + wobbleY, z: 0 };
      baseHand[8].y = 0.58 + wobbleY;
      baseHand[12].y = 0.58 + wobbleY;
      baseHand[16].y = 0.59 + wobbleY;
      baseHand[20].y = 0.60 + wobbleY;
    } else if (currentSimGesture === 'THUMBS_UP') {
      baseHand[4] = { x: 0.38 + wobbleX, y: 0.30 + wobbleY, z: -0.05 };
      baseHand[8].y = 0.58 + wobbleY;
      baseHand[12].y = 0.58 + wobbleY;
      baseHand[16].y = 0.59 + wobbleY;
      baseHand[20].y = 0.60 + wobbleY;
    } else if (currentSimGesture === 'TWO_FINGER_PINCH') {
      baseHand[4] = { x: 0.49 + wobbleX, y: 0.36 + wobbleY, z: -0.02 };
      baseHand[12] = { x: 0.50 + wobbleX, y: 0.36 + wobbleY, z: -0.02 };
      baseHand[16].y = 0.59 + wobbleY;
      baseHand[20].y = 0.60 + wobbleY;
    }

    return baseHand;
  }, []);

  // 4. Processing Loop
  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    const startTime = performance.now();

    let detectedLandmarks: Landmark[] | null = null;
    let allDetected: Landmark[][] = [];
    let detectedCount = 0;

    if (isDemoMode) {
      const demoHand = generateDemoHand(startTime);
      detectedLandmarks = demoHand;
      allDetected = [demoHand];
      detectedCount = 1;
    } else if (landmarker && video && cameraStatus === 'active') {
      if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        try {
          const results = landmarker.detectForVideo(video, startTime);
          if (results.landmarks && results.landmarks.length > 0) {
            detectedLandmarks = results.landmarks[0] as Landmark[];
            allDetected = results.landmarks as Landmark[][];
            detectedCount = results.landmarks.length;
          }
        } catch (err) {
          console.warn('Frame detection error:', err);
        }
      }
    }

    setLandmarks(detectedLandmarks);
    setAllHandsLandmarks(allDetected);
    setHandCount(detectedCount);

    // Classify gesture
    const result = classifyLandmarks(detectedLandmarks || [], isMirrored);
    setCurrentGesture(result);

    // Forward telemetry to Python backend over WebSocket for real desktop control!
    if (result.gesture !== 'NO_HAND' && result.isConfirmed) {
      wsClient.sendTelemetry(
        result.gesture,
        result.confidence,
        result.metrics.fingertip,
        result.metrics
      );

      // Add to recent detections feed if changed
      setRecentDetections(prev => {
        if (prev.length > 0 && prev[0].gesture === result.gesture) return prev;
        const item = {
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          gesture: result.gesture,
          name: result.name,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          confidence: result.confidence
        };
        return [item, ...prev.slice(0, 19)];
      });
    }

    // Performance metrics
    const endTime = performance.now();
    setLatency(Math.round(endTime - startTime));

    fpsTimestampsRef.current.push(startTime);
    const oneSecAgo = startTime - 1000;
    fpsTimestampsRef.current = fpsTimestampsRef.current.filter(t => t > oneSecAgo);
    setFps(fpsTimestampsRef.current.length);

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [cameraStatus, isDemoMode, isMirrored, classifyLandmarks, generateDemoHand, videoRef]);

  // Start / Stop processing
  useEffect(() => {
    if (modelStatus === 'ready' && (cameraStatus === 'active' || isDemoMode)) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setLandmarks(null);
      setAllHandsLandmarks([]);
      setHandCount(0);
      historyRef.current = [];
      setCurrentGesture({
        gesture: 'NO_HAND',
        name: 'No Hand Detected',
        action: 'None',
        emoji: '✋🏻',
        color: '#94A3B8',
        confidence: 0,
        fingerStates: { thumb: false, index: false, middle: false, ring: false, pinky: false },
        metrics: { pinchDistance: 1, twoFingerPinchDistance: 1, scrollDeltaY: 0, fingertip: { x: 0.5, y: 0.5 } },
        isConfirmed: false
      });
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [modelStatus, cameraStatus, isDemoMode, processFrame]);

  return {
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
  };
}
