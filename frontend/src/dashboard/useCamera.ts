import { useState, useRef, useEffect, useCallback } from 'react';

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export type CameraStatus = 'idle' | 'requesting' | 'active' | 'error' | 'stopped';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 640, height: 480 });

  // Enumerate video devices
  const updateDeviceList = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = allDevices
        .filter(d => d.kind === 'videoinput')
        .map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${i + 1}`
        }));
      setDevices(videoDevs);
    } catch (e) {
      console.warn('Failed to enumerate media devices:', e);
    }
  }, []);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStatus('stopped');
  }, []);

  // Start webcam with selected device
  const startCamera = useCallback(async (preferredDeviceId?: string) => {
    setCameraStatus('requesting');
    setErrorMessage('');

    // Stop existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          deviceId: preferredDeviceId ? { exact: preferredDeviceId } : undefined,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 20 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(e => console.warn('Play error:', e));
            setVideoDimensions({
              width: videoRef.current.videoWidth || 640,
              height: videoRef.current.videoHeight || 480
            });
          }
          setCameraStatus('active');
        };
      }

      // Listen for unexpected track disconnection
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          setCameraStatus('stopped');
          setErrorMessage('Webcam stream was disconnected by hardware or operating system.');
        };
        const settings = videoTrack.getSettings();
        if (settings.deviceId) {
          setCurrentDeviceId(settings.deviceId);
        }
      }

      await updateDeviceList();
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraStatus('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Webcam access was denied. Please allow camera permissions in your browser settings to enable hand gesture control.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera hardware was detected on this device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setErrorMessage('Your camera is currently in use by another application. Please close other video apps and retry.');
      } else {
        setErrorMessage(err.message || 'Failed to start camera.');
      }
    }
  }, [updateDeviceList]);

  // Switch camera device
  const switchCamera = useCallback(async (deviceId: string) => {
    setCurrentDeviceId(deviceId);
    await startCamera(deviceId);
  }, [startCamera]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return {
    videoRef,
    cameraStatus,
    errorMessage,
    devices,
    currentDeviceId,
    isMirrored,
    videoDimensions,
    setIsMirrored,
    startCamera,
    stopCamera,
    switchCamera
  };
}
