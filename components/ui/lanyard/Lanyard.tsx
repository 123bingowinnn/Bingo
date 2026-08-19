"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF, useTexture } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
import "./Lanyard.css";

extend({ MeshLineGeometry, MeshLineMaterial });

const CARD_GLB = "/models/lanyard/card.glb";
const DEFAULT_LANYARD = "/images/lanyard/lanyard-source.png";
const BLANK_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

type LanyardProps = {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: "cover" | "contain";
  lanyardImage?: string | null;
  lanyardWidth?: number;
};

type BandProps = Pick<
  LanyardProps,
  "frontImage" | "backImage" | "imageFit" | "lanyardImage" | "lanyardWidth"
> & {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
};

type CardModel = {
  nodes: {
    card: THREE.Mesh;
    clip: THREE.Mesh;
    clamp: THREE.Mesh;
  };
  materials: {
    base: THREE.MeshStandardMaterial;
    metal: THREE.MeshStandardMaterial;
  };
};

function drawFitted(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource & { width: number; height: number },
  rect: typeof FRONT_UV_RECT,
  width: number,
  height: number,
  fit: "cover" | "contain",
) {
  const rx = rect.x * width;
  const ry = rect.y * height;
  const rw = rect.w * width;
  const rh = rect.h * height;
  const pick = fit === "contain" ? Math.min : Math.max;
  const scale = pick(rw / image.width, rh / image.height);
  const dw = image.width * scale;
  const dh = image.height * scale;
  const dx = rx + (rw - dw) / 2;
  const dy = ry + (rh - dh) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(rx, ry, rw, rh);
  ctx.clip();
  ctx.drawImage(image, dx, dy, dw, dh);
  ctx.restore();
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = "cover",
  lanyardImage = null,
  lanyardWidth = 1,
}: BandProps) {
  const band = useRef<MeshLineGeometry>(null);
  const fixed = useRef<RapierRigidBody>(null!);
  const j1 = useRef<RapierRigidBody>(null!);
  const j2 = useRef<RapierRigidBody>(null!);
  const j3 = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const flipDirection = useRef(1);
  const isFlipped = useRef(false);
  const flipAnimation = useRef<{
    from: THREE.Quaternion;
    to: THREE.Quaternion;
    progress: number;
  } | null>(null);
  const vec = useMemo(() => new THREE.Vector3(), []);
  const ang = useMemo(() => new THREE.Vector3(), []);
  const rot = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const segmentProps = {
    type: "dynamic" as const,
    canSleep: true,
    colliders: false as const,
    angularDamping: 4,
    linearDamping: 4,
  };

  const { nodes, materials } = useGLTF(CARD_GLB) as unknown as CardModel;
  const texture = useTexture(lanyardImage || DEFAULT_LANYARD);
  const bandTexture = useMemo(() => {
    const next = texture.clone();
    next.wrapS = next.wrapT = THREE.RepeatWrapping;
    next.needsUpdate = true;
    return next;
  }, [texture]);
  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);
  const [curve] = useState(() => {
    const next = new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]);
    next.curveType = "chordal";
    return next;
  });
  const [dragged, setDragged] = useState<THREE.Vector3 | false>(false);
  const [hovered, setHovered] = useState(false);

  const cardMap = useMemo(() => {
    const baseMap = materials.base.map;
    if (!baseMap || (!frontImage && !backImage)) return baseMap;

    const baseImage = baseMap.image as HTMLImageElement;
    const canvas = document.createElement("canvas");
    canvas.width = baseImage.width;
    canvas.height = baseImage.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return baseMap;

    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    if (frontImage && frontTex.image) {
      drawFitted(
        ctx,
        frontTex.image as HTMLImageElement,
        FRONT_UV_RECT,
        canvas.width,
        canvas.height,
        imageFit,
      );
    }
    if (backImage && backTex.image) {
      drawFitted(
        ctx,
        backTex.image as HTMLImageElement,
        BACK_UV_RECT,
        canvas.width,
        canvas.height,
        imageFit,
      );
    }

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [backImage, backTex.image, frontImage, frontTex.image, imageFit, materials.base.map]);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 0.55]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 0.55]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 0.55]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.5, 0]]);

  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = dragged ? "grabbing" : "grab";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [dragged, hovered]);

  useEffect(() => {
    if (!dragged) return;

    const releaseOutsideCanvas = () => {
      pointerStart.current = null;
      setDragged(false);
      [card, j1, j2, j3, fixed].forEach((body) => body.current?.wakeUp());
    };

    window.addEventListener("pointerup", releaseOutsideCanvas);
    window.addEventListener("pointercancel", releaseOutsideCanvas);
    window.addEventListener("blur", releaseOutsideCanvas);
    return () => {
      window.removeEventListener("pointerup", releaseOutsideCanvas);
      window.removeEventListener("pointercancel", releaseOutsideCanvas);
      window.removeEventListener("blur", releaseOutsideCanvas);
    };
  }, [dragged]);

  useFrame((state, delta) => {
    if (dragged && card.current) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((body) => body.current?.wakeUp());
      card.current.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }

    if (!fixed.current || !j1.current || !j2.current || !j3.current || !card.current || !band.current) return;

    [j1.current, j2.current].forEach((body) => {
      const point = body as RapierRigidBody & { lerped?: THREE.Vector3 };
      if (!point.lerped) point.lerped = new THREE.Vector3().copy(body.translation());
      const distance = Math.max(0.1, Math.min(1, point.lerped.distanceTo(body.translation())));
      point.lerped.lerp(body.translation(), delta * (minSpeed + distance * (maxSpeed - minSpeed)));
    });

    const p1 = j1.current as RapierRigidBody & { lerped: THREE.Vector3 };
    const p2 = j2.current as RapierRigidBody & { lerped: THREE.Vector3 };
    curve.points[0].copy(j3.current.translation());
    curve.points[1].copy(p2.lerped);
    curve.points[2].copy(p1.lerped);
    curve.points[3].copy(fixed.current.translation());
    band.current.setPoints(curve.getPoints(isMobile ? 16 : 32));

    const activeFlip = flipAnimation.current;
    if (activeFlip) {
      activeFlip.progress = Math.min(1, activeFlip.progress + delta / 0.65);
      const eased = 1 - Math.pow(1 - activeFlip.progress, 3);
      const nextRotation = new THREE.Quaternion().slerpQuaternions(activeFlip.from, activeFlip.to, eased);
      card.current.setRotation(nextRotation, true);
      card.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      if (activeFlip.progress === 1) flipAnimation.current = null;
    } else {
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel(
        { x: ang.x, y: isFlipped.current ? 0 : ang.y - rot.y * 0.25, z: ang.z },
        true,
      );
    }
  });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!card.current) return;
    event.stopPropagation();
    pointerStart.current = { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY };
    (event.target as unknown as { setPointerCapture: (pointerId: number) => void }).setPointerCapture(event.pointerId);
    setDragged(new THREE.Vector3().copy(event.point).sub(vec.copy(card.current.translation())));
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const target = event.target as unknown as {
      hasPointerCapture?: (pointerId: number) => boolean;
      releasePointerCapture: (pointerId: number) => void;
    };
    if (!target.hasPointerCapture || target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    const start = pointerStart.current;
    const movement = start
      ? Math.hypot(event.nativeEvent.clientX - start.x, event.nativeEvent.clientY - start.y)
      : Infinity;
    const shouldFlip = movement < 6;
    pointerStart.current = null;
    setDragged(false);
    [card, j1, j2, j3, fixed].forEach((body) => body.current?.wakeUp());
    if (shouldFlip) {
      const direction = flipDirection.current;
      flipDirection.current *= -1;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!card.current) return;
          const from = new THREE.Quaternion().copy(card.current.rotation());
          const turn = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), direction * Math.PI);
          flipAnimation.current = {
            from,
            to: from.clone().multiply(turn),
            progress: 0,
          };
          isFlipped.current = !isFlipped.current;
        });
      });
    }
  };

  return (
    <>
      <group position={[0, 2.8, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.275, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0.55, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0.825, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[1.1, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerUp={handlePointerUp}
            onPointerDown={handlePointerDown}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh>
        <meshLineGeometry ref={band} />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={bandTexture}
          repeat={[-1, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = "cover",
  lanyardImage = null,
  lanyardWidth = 1,
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="lanyard-wrapper" aria-label="Interactive profile lanyard">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Suspense fallback={null}>
          <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
            <Band
              isMobile={isMobile}
              frontImage={frontImage}
              backImage={backImage}
              imageFit={imageFit}
              lanyardImage={lanyardImage}
              lanyardWidth={lanyardWidth}
            />
          </Physics>
          <Environment blur={0.75}>
            <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(CARD_GLB);
