'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame, type Object3DNode, type MaterialNode, type ThreeEvent } from '@react-three/fiber';
import { useTexture, Environment, Lightformer } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

extend({ MeshLineGeometry, MeshLineMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: Object3DNode<MeshLineGeometry, typeof MeshLineGeometry>;
    meshLineMaterial: MaterialNode<MeshLineMaterial, typeof MeshLineMaterial>;
  }
}

const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const FRONT_UV_RECT = { x: 0, y: 0, w: 1, h: 1 };
const BACK_UV_RECT = { x: 0, y: 0, w: 1, h: 1 };

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardImage?: string | null;
  lanyardWidth?: number;
  attendeeName?: string;
  ticketType?: string;
  avatarUrl?: string | null;
}

export default function Lanyard({
  position = [0, 0, 22],
  gravity = [0, -40, 0],
  fov = 15,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1,
  attendeeName,
  ticketType,
  avatarUrl
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [dynamicFrontImage, setDynamicFrontImage] = useState<string>(frontImage || BLANK_PIXEL);

  useEffect(() => {
    const handleResize = (): void => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    // If no dynamic props are provided, use frontImage or BLANK_PIXEL
    if (!attendeeName && !ticketType && !avatarUrl) {
      setDynamicFrontImage(frontImage || BLANK_PIXEL);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 2400; // 3x resolution (4k quality)
    canvas.height = 3375;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Scale drawing context to match the 3x resolution bump
    ctx.scale(3, 3);

    const renderCanvas = (avatarImg: HTMLImageElement | null) => {
      // Draw colorful gradient background
      const grad = ctx.createLinearGradient(0, 0, 800, 1125);
      grad.addColorStop(0, '#4f46e5'); // indigo-600
      grad.addColorStop(1, '#c026d3'); // fuchsia-600
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 1125);

      // Top Header
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, 800, 200);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 70px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('EventSpark', 400, 100);
      
      ctx.font = 'bold 40px Inter, sans-serif';
      ctx.fillStyle = '#fbcfe8';
      ctx.fillText((ticketType || 'VIP PASS').toUpperCase(), 400, 160);

      // Avatar
      if (avatarImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(400, 500, 200, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, 200, 300, 400, 400);
        ctx.restore();
        
        ctx.lineWidth = 15;
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.arc(400, 500, 200, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.arc(400, 500, 200, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 150px Inter, sans-serif';
        ctx.fillText(attendeeName ? attendeeName.charAt(0).toUpperCase() : 'U', 400, 550);
      }

      // Name
      ctx.font = 'bold 70px Inter, sans-serif';
      ctx.fillStyle = 'white';
      ctx.fillText(attendeeName || 'Attendee', 400, 850);
      
      // Bottom Bar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 950, 800, 175);
      
      // Additional text for realism
      ctx.font = '500 30px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('DIGITAL ENTRY PASS', 400, 1010);
      ctx.fillText('NON-TRANSFERABLE', 400, 1070);
      
      setDynamicFrontImage(canvas.toDataURL('image/png'));
    };

    if (avatarUrl) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => renderCanvas(img);
      img.onerror = () => renderCanvas(null);
      img.src = avatarUrl;
    } else {
      renderCanvas(null);
    }
  }, [attendeeName, ticketType, avatarUrl, frontImage]);

  return (
    <div className="relative z-0 w-full h-[60vh] flex justify-center items-center transform scale-100 origin-center">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            isMobile={isMobile}
            frontImage={dynamicFrontImage}
            backImage={backImage}
            imageFit={imageFit}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardImage?: string | null;
  lanyardWidth?: number;
}

type LanyardRigidBody = RapierRigidBody & {
  lerped?: THREE.Vector3;
};

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1
}: BandProps) {
  const band = useRef<THREE.Mesh<InstanceType<typeof MeshLineGeometry>, InstanceType<typeof MeshLineMaterial>>>(null!);
  const fixed = useRef<RapierRigidBody>(null!);
  const j1 = useRef<LanyardRigidBody>(null!);
  const j2 = useRef<LanyardRigidBody>(null!);
  const j3 = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps: RigidBodyProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4
  };

  const getLerped = (body: LanyardRigidBody): THREE.Vector3 => {
    if (!body.lerped) {
      body.lerped = new THREE.Vector3().copy(body.translation());
    }

    return body.lerped;
  };

  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);

  useEffect(() => {
    if (frontTex) {
      frontTex.anisotropy = 16;
      frontTex.minFilter = THREE.LinearMipmapLinearFilter;
      frontTex.needsUpdate = true;
    }
    if (backTex) {
      backTex.anisotropy = 16;
      backTex.minFilter = THREE.LinearMipmapLinearFilter;
      backTex.needsUpdate = true;
    }
  }, [frontTex, backTex]);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
    } else {
      document.body.style.cursor = 'auto';
    }
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered, dragged]);

  useEffect(() => {
    if (dragged) {
      const handleUp = () => drag(false);
      window.addEventListener('pointerup', handleUp);
      return () => window.removeEventListener('pointerup', handleUp);
    }
  }, [dragged]);

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== 'boolean') {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z
      }, true);
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        const lerped = getLerped(ref.current);
        const clampedDistance = Math.max(0.1, Math.min(1, lerped.distanceTo(ref.current.translation())));
        lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(getLerped(j2.current));
      curve.points[2].copy(getLerped(j1.current));
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
    }
  });

  curve.curveType = 'chordal';

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type="dynamic"
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              const pos = card.current?.translation();
              if (pos) {
                drag(new THREE.Vector3().copy(e.point).sub(vec.set(pos.x, pos.y, pos.z)));
              }
            }}
          >
            <mesh position={[0, 0, 0.01]}>
              <boxGeometry args={[0.8, 1.125, 0.01]} />
              <meshPhysicalMaterial map={frontTex} />
            </mesh>
            <mesh position={[0, 0, -0.01]} rotation={[0, Math.PI, 0]}>
              <boxGeometry args={[0.8, 1.125, 0.01]} />
              <meshPhysicalMaterial map={backTex} />
            </mesh>
            {/* Mock clip and clamp */}
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
              <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? new THREE.Vector2(1000, 2000) : new THREE.Vector2(1000, 1000)}
          lineWidth={lanyardWidth * 2}
        />
      </mesh>
    </>
  );
}
