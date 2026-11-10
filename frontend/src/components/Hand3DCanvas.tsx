import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GESTURE_DEFINITIONS } from '../gestures/gestureDefinitions';

interface Hand3DCanvasProps {
  currentGesture?: string;
  interactive?: boolean;
  autoRotate?: boolean;
  className?: string;
  showParticles?: boolean;
  zoom?: number;
  customRotations?: {
    thumb: number[];
    index: number[];
    middle: number[];
    ring: number[];
    pinky: number[];
  };
}

export default function Hand3DCanvas({
  currentGesture = 'OPEN_PALM',
  interactive = true,
  autoRotate = true,
  className = 'w-full h-full min-h-[360px]',
  showParticles = true,
  zoom = 1.0,
  customRotations
}: Hand3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const handGroupRef = useRef<THREE.Group | null>(null);
  const fingersRef = useRef<any[]>([]);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.15, y: -0.2 });
  const currentRotationRef = useRef({ x: 0.15, y: -0.2 });
  const activeGestureRef = useRef(currentGesture);
  const customRotationsRef = useRef(customRotations);

  useEffect(() => {
    activeGestureRef.current = currentGesture;
  }, [currentGesture]);

  useEffect(() => {
    customRotationsRef.current = customRotations;
  }, [customRotations]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 400;
    const height = mount.clientHeight || 400;

    // Scene with soft warm off-white atmospheric fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xFAF9F4, 0.035);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 4.6 / zoom);
    camera.lookAt(0, 0.2, 0);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting (Premium Bright Yellow & Pure White Studio Lighting)
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.4);
    scene.add(ambientLight);

    // Main key light with clean white studio illumination
    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 2.2);
    keyLight.position.set(4, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Bright Premium Yellow Rim Light
    const rimLight = new THREE.PointLight(0xFFD633, 3.8, 12);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    // Warm Ambient Fill Light
    const fillLight = new THREE.DirectionalLight(0xFFFBEB, 1.0);
    fillLight.position.set(-5, 3, 2);
    scene.add(fillLight);

    // Ground Shadow Plane
    const shadowPlaneGeo = new THREE.PlaneGeometry(10, 10);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.06 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.6;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Subtle Bright Golden Orbital Grid Ring
    const ringGeo = new THREE.RingGeometry(2.1, 2.12, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xFFD633,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.40
    });
    const orbitalRing = new THREE.Mesh(ringGeo, ringMat);
    orbitalRing.rotation.x = Math.PI / 2.3;
    orbitalRing.position.y = -0.5;
    scene.add(orbitalRing);

    // Floating Rose Pink Particles
    let particlesMesh: THREE.Points | null = null;
    if (showParticles) {
      const pCount = 50;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i += 3) {
        pPos[i] = (Math.random() - 0.5) * 5;
        pPos[i + 1] = (Math.random() - 0.5) * 4;
        pPos[i + 2] = (Math.random() - 0.5) * 4;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0xF472B6,
        size: 0.05,
        transparent: true,
        opacity: 0.65
      });
      particlesMesh = new THREE.Points(pGeo, pMat);
      scene.add(particlesMesh);
    }

    // Hand Assembly Hierarchy
    const handGroup = new THREE.Group();
    handGroup.position.set(0, -0.4, 0);
    scene.add(handGroup);
    handGroupRef.current = handGroup;

    // Materials: Pristine Porcelain White + Metallic Bright Gold Joints
    const porcelainMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFFAFA,
      roughness: 0.14,
      metalness: 0.05,
      clearcoat: 0.75,
      clearcoatRoughness: 0.08,
      reflectivity: 0.85
    });

    const goldJointMat = new THREE.MeshStandardMaterial({
      color: 0xFFD633,
      emissive: 0xF5C21B,
      emissiveIntensity: 0.35,
      metalness: 0.85,
      roughness: 0.20
    });

    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xF5C21B,
      metalness: 0.90,
      roughness: 0.18
    });

    // 1. Palm Construction
    const palmGeo = new THREE.BoxGeometry(1.0, 1.15, 0.28);
    const palmMesh = new THREE.Mesh(palmGeo, porcelainMat);
    palmMesh.castShadow = true;
    palmMesh.receiveShadow = true;
    palmMesh.position.set(0, 0.45, 0);
    handGroup.add(palmMesh);

    // Palm Core Accent Plaque (Bright Gold GESTURA AI Core Emblem)
    const plaqueGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.30, 24);
    plaqueGeo.rotateX(Math.PI / 2);
    const plaqueMesh = new THREE.Mesh(plaqueGeo, goldJointMat);
    plaqueMesh.position.set(0, 0.45, 0.01);
    handGroup.add(plaqueMesh);

    // 2. Wrist Base
    const wristGeo = new THREE.CylinderGeometry(0.40, 0.45, 0.5, 24);
    const wristMesh = new THREE.Mesh(wristGeo, goldAccentMat);
    wristMesh.position.set(0, -0.22, 0);
    wristMesh.castShadow = true;
    handGroup.add(wristMesh);

    // 3. Articulated Fingers Generator
    // Index: 0=thumb, 1=index, 2=middle, 3=ring, 4=pinky
    const fingerConfigs = [
      { name: 'thumb', x: -0.58, y: 0.15, z: 0.05, length: 0.38, radius: 0.10, isThumb: true },
      { name: 'index', x: -0.34, y: 1.02, z: 0.0, length: 0.44, radius: 0.09, isThumb: false },
      { name: 'middle', x: -0.02, y: 1.06, z: 0.0, length: 0.50, radius: 0.095, isThumb: false },
      { name: 'ring', x: 0.30, y: 1.01, z: 0.0, length: 0.44, radius: 0.088, isThumb: false },
      { name: 'pinky', x: 0.58, y: 0.90, z: 0.0, length: 0.36, radius: 0.08, isThumb: false },
    ];

    const fingers: any[] = [];

    fingerConfigs.forEach((cfg) => {
      const rootJoint = new THREE.Group();
      rootJoint.position.set(cfg.x, cfg.y, cfg.z);
      handGroup.add(rootJoint);

      // Metacarpal / base sphere node
      const jointSphereGeo = new THREE.SphereGeometry(cfg.radius * 1.25, 16, 16);
      const baseNode = new THREE.Mesh(jointSphereGeo, goldJointMat);
      baseNode.castShadow = true;
      rootJoint.add(baseNode);

      // Phalanx 1 (Proximal)
      const p1Geo = new THREE.CylinderGeometry(cfg.radius * 0.9, cfg.radius * 1.05, cfg.length, 16);
      p1Geo.translate(0, cfg.length / 2, 0);
      const p1Mesh = new THREE.Mesh(p1Geo, porcelainMat);
      p1Mesh.castShadow = true;
      rootJoint.add(p1Mesh);

      // Joint 2 Group
      const joint2 = new THREE.Group();
      joint2.position.set(0, cfg.length, 0);
      rootJoint.add(joint2);

      const midNode = new THREE.Mesh(new THREE.SphereGeometry(cfg.radius * 1.1, 16, 16), goldJointMat);
      midNode.castShadow = true;
      joint2.add(midNode);

      // Phalanx 2 (Intermediate)
      const p2Len = cfg.length * 0.78;
      const p2Geo = new THREE.CylinderGeometry(cfg.radius * 0.8, cfg.radius * 0.95, p2Len, 16);
      p2Geo.translate(0, p2Len / 2, 0);
      const p2Mesh = new THREE.Mesh(p2Geo, porcelainMat);
      p2Mesh.castShadow = true;
      joint2.add(p2Mesh);

      // Joint 3 Group
      const joint3 = new THREE.Group();
      joint3.position.set(0, p2Len, 0);
      joint2.add(joint3);

      const tipNode = new THREE.Mesh(new THREE.SphereGeometry(cfg.radius * 0.95, 16, 16), goldJointMat);
      tipNode.castShadow = true;
      joint3.add(tipNode);

      // Phalanx 3 (Distal / Fingertip cap)
      const p3Len = cfg.length * 0.55;
      const p3Geo = new THREE.CylinderGeometry(cfg.radius * 0.65, cfg.radius * 0.82, p3Len, 16);
      p3Geo.translate(0, p3Len / 2, 0);
      const p3Mesh = new THREE.Mesh(p3Geo, porcelainMat);
      p3Mesh.castShadow = true;
      joint3.add(p3Mesh);

      // Fingertip dome with bright gold cap
      const domeGeo = new THREE.SphereGeometry(cfg.radius * 0.65, 16, 16);
      domeGeo.translate(0, p3Len, 0);
      const domeMesh = new THREE.Mesh(domeGeo, goldAccentMat);
      joint3.add(domeMesh);

      fingers.push({
        name: cfg.name,
        isThumb: cfg.isThumb,
        rootJoint,
        joint2,
        joint3,
        currentRot: [0, 0, 0],
        targetRot: [0, 0, 0]
      });
    });

    fingersRef.current = fingers;

    // Mouse Drag Interaction Handlers
    const handleMouseDown = (e: MouseEvent) => {
      if (!interactive) return;
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      targetRotationRef.current.y += dx * 0.008;
      targetRotationRef.current.x += dy * 0.008;
      targetRotationRef.current.x = Math.max(-0.6, Math.min(0.8, targetRotationRef.current.x));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Responsive Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      if (newW && newH) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    };
    window.addEventListener('resize', handleResize);

    // 4. Main 60 FPS Render Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Orbital Ring slow rotation
      orbitalRing.rotation.z = elapsedTime * 0.15;

      // Particle floating drift
      if (particlesMesh) {
        particlesMesh.rotation.y = elapsedTime * 0.04;
      }

      // Smooth Hand Drag Orbit Rotation
      if (autoRotate && !isDraggingRef.current) {
        targetRotationRef.current.y = -0.2 + Math.sin(elapsedTime * 0.8) * 0.22;
        targetRotationRef.current.x = 0.15 + Math.cos(elapsedTime * 0.6) * 0.08;
      }

      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.1;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.1;

      handGroup.rotation.x = currentRotationRef.current.x;
      handGroup.rotation.y = currentRotationRef.current.y;

      // Subtle float motion
      handGroup.position.y = -0.4 + Math.sin(elapsedTime * 1.5) * 0.05;

      // Determine Target Joint Angles
      let targetPoses: any = null;
      if (customRotationsRef.current) {
        targetPoses = customRotationsRef.current;
      } else {
        const def = GESTURE_DEFINITIONS[activeGestureRef.current] || GESTURE_DEFINITIONS.OPEN_PALM;
        targetPoses = def.poseRotations;
      }

      // Smooth Finger Joint Interpolation (LERP)
      fingers.forEach((f) => {
        const pose = targetPoses[f.name] || [0, 0, 0];
        const radX = (pose[0] * Math.PI) / 180;
        const radY = (pose[1] * Math.PI) / 180;
        const radZ = (pose[2] * Math.PI) / 180;

        // Root joint lerp
        f.rootJoint.rotation.x += (radX * 0.6 - f.rootJoint.rotation.x) * 0.15;
        f.rootJoint.rotation.y += (radY - f.rootJoint.rotation.y) * 0.15;
        f.rootJoint.rotation.z += (radZ - f.rootJoint.rotation.z) * 0.15;

        // Middle joint lerp
        f.joint2.rotation.x += (radX * 0.8 - f.joint2.rotation.x) * 0.15;

        // Distal joint lerp
        f.joint3.rotation.x += (radX * 0.5 - f.joint3.rotation.x) * 0.15;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [interactive, autoRotate, zoom, showParticles]);

  return (
    <div
      ref={mountRef}
      className={`relative cursor-grab active:cursor-grabbing select-none ${className}`}
      title={interactive ? 'Drag with mouse to rotate 3D Hand Model' : undefined}
    />
  );
}
