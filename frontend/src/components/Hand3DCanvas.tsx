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

    // Scene with warm off-white atmospheric fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xFAF9F4, 0.04);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 4.6 / zoom);
    camera.lookAt(0, 0.2, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting (Yellow & Pure White Studio Lighting)
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.4);
    scene.add(ambientLight);

    // Main key light with subtle golden warm hue
    const keyLight = new THREE.DirectionalLight(0xFFFBE6, 2.2);
    keyLight.position.set(4, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Yellow Accent Rim Light
    const rimLight = new THREE.PointLight(0xFFD633, 3.5, 12);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    // Soft Fill Light
    const fillLight = new THREE.DirectionalLight(0xFFFFFF, 0.9);
    fillLight.position.set(-5, 3, 2);
    scene.add(fillLight);

    // Ground Shadow Plane
    const shadowPlaneGeo = new THREE.PlaneGeometry(10, 10);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.08 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.6;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Subtle Golden Orbital Grid Ring
    const ringGeo = new THREE.RingGeometry(2.1, 2.12, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xFFD633,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25
    });
    const orbitalRing = new THREE.Mesh(ringGeo, ringMat);
    orbitalRing.rotation.x = Math.PI / 2.3;
    orbitalRing.position.y = -0.5;
    scene.add(orbitalRing);

    // Floating Golden Particles
    let particlesMesh: THREE.Points | null = null;
    if (showParticles) {
      const pCount = 45;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i += 3) {
        pPos[i] = (Math.random() - 0.5) * 5;
        pPos[i + 1] = (Math.random() - 0.5) * 4;
        pPos[i + 2] = (Math.random() - 0.5) * 4;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0xFFD633,
        size: 0.045,
        transparent: true,
        opacity: 0.55
      });
      particlesMesh = new THREE.Points(pGeo, pMat);
      scene.add(particlesMesh);
    }

    // Hand Assembly Hierarchy
    const handGroup = new THREE.Group();
    handGroup.position.set(0, -0.4, 0);
    scene.add(handGroup);
    handGroupRef.current = handGroup;

    // Materials: Pristine Porcelain White + Bright Yellow Metallic Joints
    const porcelainMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFFFFF,
      roughness: 0.18,
      metalness: 0.05,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
      reflectivity: 0.8
    });

    const yellowJointMat = new THREE.MeshStandardMaterial({
      color: 0xFFD633,
      emissive: 0xF5C21B,
      emissiveIntensity: 0.45,
      metalness: 0.7,
      roughness: 0.25
    });

    const goldenAccentMat = new THREE.MeshStandardMaterial({
      color: 0xE5B800,
      metalness: 0.85,
      roughness: 0.2
    });

    // 1. Palm Construction
    const palmGeo = new THREE.BoxGeometry(1.0, 1.15, 0.28);
    const palmMesh = new THREE.Mesh(palmGeo, porcelainMat);
    palmMesh.castShadow = true;
    palmMesh.receiveShadow = true;
    palmMesh.position.set(0, 0.45, 0);
    handGroup.add(palmMesh);

    // Palm Core Accent Plaque (Golden Yellow GESTURA Emblem)
    const plaqueGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.30, 24);
    plaqueGeo.rotateX(Math.PI / 2);
    const plaqueMesh = new THREE.Mesh(plaqueGeo, yellowJointMat);
    plaqueMesh.position.set(0, 0.45, 0.01);
    handGroup.add(plaqueMesh);

    // 2. Wrist Base
    const wristGeo = new THREE.CylinderGeometry(0.40, 0.45, 0.5, 24);
    const wristMesh = new THREE.Mesh(wristGeo, goldenAccentMat);
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
      const baseNode = new THREE.Mesh(jointSphereGeo, yellowJointMat);
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

      const midNode = new THREE.Mesh(new THREE.SphereGeometry(cfg.radius * 1.1, 16, 16), yellowJointMat);
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

      const tipNode = new THREE.Mesh(new THREE.SphereGeometry(cfg.radius * 0.95, 16, 16), yellowJointMat);
      tipNode.castShadow = true;
      joint3.add(tipNode);

      // Phalanx 3 (Distal / Fingertip cap)
      const p3Len = cfg.length * 0.55;
      const p3Geo = new THREE.CylinderGeometry(cfg.radius * 0.65, cfg.radius * 0.82, p3Len, 16);
      p3Geo.translate(0, p3Len / 2, 0);
      const p3Mesh = new THREE.Mesh(p3Geo, porcelainMat);
      p3Mesh.castShadow = true;
      joint3.add(p3Mesh);

      // Fingertip dome
      const domeGeo = new THREE.SphereGeometry(cfg.radius * 0.65, 16, 16);
      domeGeo.translate(0, p3Len, 0);
      const domeMesh = new THREE.Mesh(domeGeo, goldenAccentMat);
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

    // Mouse Interaction Handlers
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

    const domElement = mount;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Ambient Idle Rotation
      if (autoRotate && !isDraggingRef.current) {
        targetRotationRef.current.y = -0.2 + Math.sin(elapsed * 0.7) * 0.15;
        targetRotationRef.current.x = 0.12 + Math.cos(elapsed * 0.5) * 0.06;
      }

      // Smooth Rotation Lerp
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;

      if (handGroupRef.current) {
        handGroupRef.current.rotation.x = currentRotationRef.current.x;
        handGroupRef.current.rotation.y = currentRotationRef.current.y;
        // Subtle floating bob
        handGroupRef.current.position.y = -0.4 + Math.sin(elapsed * 1.5) * 0.04;
      }

      // Floating particles drift
      if (particlesMesh) {
        particlesMesh.rotation.y = elapsed * 0.04;
      }

      // Target pose angles
      const currentG = activeGestureRef.current;
      const def = GESTURE_DEFINITIONS[currentG] || GESTURE_DEFINITIONS.OPEN_PALM;
      const poseMap = customRotationsRef.current || def.poseRotations;

      // Smoothly interpolate each finger bone rotation towards target pose
      fingers.forEach((f) => {
        const anglesDeg = (poseMap as any)[f.name] || [0, 0, 0];
        const radX = THREE.MathUtils.degToRad(anglesDeg[0] || 0);
        const radY = THREE.MathUtils.degToRad(anglesDeg[1] || 0);
        const radZ = THREE.MathUtils.degToRad(anglesDeg[2] || 0);

        if (f.isThumb) {
          f.rootJoint.rotation.x += (radX * 0.7 - f.rootJoint.rotation.x) * 0.12;
          f.rootJoint.rotation.y += (radY - f.rootJoint.rotation.y) * 0.12;
          f.rootJoint.rotation.z += (radZ - f.rootJoint.rotation.z) * 0.12;
          f.joint2.rotation.x += (radX * 0.5 - f.joint2.rotation.x) * 0.12;
          f.joint3.rotation.x += (radX * 0.4 - f.joint3.rotation.x) * 0.12;
        } else {
          f.rootJoint.rotation.x += (radX * 0.5 - f.rootJoint.rotation.x) * 0.12;
          f.rootJoint.rotation.y += (radY - f.rootJoint.rotation.y) * 0.12;
          f.joint2.rotation.x += (radX * 0.35 - f.joint2.rotation.x) * 0.12;
          f.joint3.rotation.x += (radX * 0.25 - f.joint3.rotation.x) * 0.12;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!mount) return;
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    });
    resizeObserver.observe(mount);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [interactive, autoRotate, showParticles, zoom]);

  return (
    <div className={`relative ${className} select-none cursor-grab active:cursor-grabbing`}>
      <div ref={mountRef} className="w-full h-full" />
      {interactive && (
        <div className="absolute bottom-3 right-3 text-[11px] font-mono font-medium text-gestura-textSubtle bg-white/80 px-2.5 py-1 rounded-full border border-gestura-border shadow-sm pointer-events-none">
          Click & Drag to Rotate 3D Hand
        </div>
      )}
    </div>
  );
}
