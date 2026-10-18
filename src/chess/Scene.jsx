import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshReflectorMaterial, OrbitControls, SpotLight } from '@react-three/drei';
import { boardTexture, pieceGeometries, pieceMaterials } from './geometry.js';

/* Coordinates: one square = 1 unit, board top at y = 0.
   White's back rank (rank 1) sits at +z, Black's at −z. */
const sqToXZ = (sq) => [sq.charCodeAt(0) - 97 - 3.5, 3.5 - (Number(sq[1]) - 1)];
const xzToSq = (x, z) => {
  const f = Math.floor(x + 4);
  const r = Math.floor(4 - z);
  return f >= 0 && f < 8 && r >= 0 && r < 8 ? `${'abcdefgh'[f]}${r + 1}` : null;
};
const capturedXZ = ({ by, slot }) => {
  const side = by === 'w' ? 1 : -1; // White's captures line up on its right
  const col = Math.floor(slot / 8);
  return [side * (5.05 + col * 0.62), side * (3.2 - (slot % 8) * 0.9)];
};

const PRESETS = {
  player: { pos: [0, 10.2, 11.2], target: [0, -0.4, 0.4] },
  top: { pos: [0, 16.5, 0.01], target: [0, 0, 0] },
  cinematic: { pos: [9.6, 5.2, 9.2], target: [0, 0, 0] },
};

function CameraRig({ view, orientation, resetKey, reduced }) {
  const size = useThree((st) => st.size);
  const controls = useThree((st) => st.controls);
  const get = useThree((st) => st.get);
  const goal = useRef(null);
  const aspect = size.width / Math.max(1, size.height);

  useEffect(() => {
    // Portrait screens get a wider lens, and every view is pulled back
    // until the whole board (about 10.4 units with trays) fits across.
    const { camera } = get();
    camera.fov = aspect < 0.9 ? 50 : 38;
    camera.updateProjectionMatrix();
    const s = orientation === 'w' ? 1 : -1;
    const p = PRESETS[view];
    const target = new THREE.Vector3(p.target[0] * s, p.target[1], p.target[2] * s);
    const pos = new THREE.Vector3(p.pos[0] * s, p.pos[1], p.pos[2] * s);
    const dist = pos.distanceTo(target);
    // Portrait: frame the board itself (captures are listed in the panel).
    const halfW = aspect < 0.9 ? 4.75 : view === 'top' ? 5.6 : 5.9;
    const needed = halfW / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.min(aspect, 1.5));
    const k = Math.max(1, needed / dist);
    goal.current = { pos: target.clone().add(pos.sub(target).multiplyScalar(k)), target };
  }, [view, orientation, resetKey, aspect, get]);

  useEffect(() => {
    if (!controls) return undefined;
    const cancel = () => (goal.current = null);
    controls.addEventListener('start', cancel);
    return () => controls.removeEventListener('start', cancel);
  }, [controls]);

  useFrame((state, dt) => {
    const { camera, scene, controls: ctl } = state;
    if (!ctl) return;
    // Atmosphere follows the camera so the board never sinks into the fog.
    const d = camera.position.distanceTo(ctl.target);
    if (scene.fog) {
      scene.fog.near = d + 2;
      scene.fog.far = d + 30;
    }
    const g = goal.current;
    if (!g) return;
    const k = reduced ? 1 : 1 - Math.exp(-dt * 3.2);
    camera.position.lerp(g.pos, k);
    ctl.target.lerp(g.target, k);
    ctl.update();
    if (camera.position.distanceTo(g.pos) < 0.01 && ctl.target.distanceTo(g.target) < 0.01) goal.current = null;
  });
  return null;
}

function Piece({ piece, selected, dragPos, reduced, interactive, onPointerDown, onClick }) {
  const ref = useRef();
  const geos = pieceGeometries();
  const mats = pieceMaterials();
  const scale = piece.captured ? 0.62 : 1;
  const [tx, tz] = piece.captured ? capturedXZ(piece.captured) : sqToXZ(piece.square);
  const target = useMemo(() => new THREE.Vector3(), []);
  const first = useRef(true);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    if (dragPos) target.set(dragPos[0], 0.45, dragPos[2]);
    else target.set(tx, piece.captured ? -0.12 : 0, tz);
    if (first.current || reduced) {
      g.position.copy(target);
      first.current = false;
    } else {
      const k = 1 - Math.exp(-dt * (dragPos ? 30 : 9));
      const before = Math.hypot(target.x - g.position.x, target.z - g.position.z);
      g.position.x += (target.x - g.position.x) * k;
      g.position.z += (target.z - g.position.z) * k;
      // A small arc while travelling, so pieces lift rather than slide.
      const lift = dragPos ? 0.45 : target.y + Math.min(0.55, before * 0.32);
      g.position.y += (lift - g.position.y) * Math.min(1, k * 1.6);
    }
    const s = g.scale.x + (scale * (selected ? 1.06 : 1) - g.scale.x) * Math.min(1, dt * 10);
    g.scale.setScalar(s);
  });

  return (
    <group
      ref={ref}
      rotation={[0, piece.color === 'b' ? Math.PI : 0, 0]}
      onPointerDown={interactive ? onPointerDown : undefined}
      onClick={onClick}
    >
      <mesh geometry={geos[piece.type]} material={mats[piece.color]} castShadow receiveShadow />
      {selected && (
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, 0.43, 48]} />
          <meshBasicMaterial color="#e8590c" toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

function SquareMark({ sq, kind }) {
  const [x, z] = sqToXZ(sq);
  if (kind === 'move') {
    return (
      <mesh position={[x, 0.006, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.13, 32]} />
        <meshBasicMaterial color="#e8590c" transparent opacity={0.9} toneMapped={false} />
      </mesh>
    );
  }
  if (kind === 'capture') {
    return (
      <mesh position={[x, 0.006, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.47, 4, 1, Math.PI / 4]} />
        <meshBasicMaterial color="#e8590c" toneMapped={false} />
      </mesh>
    );
  }
  const style = {
    selected: { color: '#e8590c', opacity: 0.32 },
    last: { color: '#f2e6cf', opacity: 0.2 },
    check: { color: '#ff3d00', opacity: 0.55 },
  }[kind];
  return (
    <mesh position={[x, 0.004, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color={style.color} transparent opacity={style.opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function Board() {
  const { tex, total } = useMemo(() => boardTexture(), []);
  const top = useMemo(
    () => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.42, metalness: 0.05 }),
    [tex],
  );
  const side = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0f0f0f', roughness: 0.5 }), []);
  return (
    <group>
      <mesh position={[0, -0.07, 0]} material={[side, side, top, side, side, side]} receiveShadow castShadow>
        <boxGeometry args={[total, 0.14, total]} />
      </mesh>
      <mesh position={[0, -0.32, 0]} receiveShadow>
        <boxGeometry args={[total + 0.4, 0.36, total + 0.4]} />
        <meshStandardMaterial color="#090909" roughness={0.6} />
      </mesh>
      {/* A thin line of burnt orange between board and plinth. */}
      <mesh position={[0, -0.145, 0]}>
        <boxGeometry args={[total + 0.06, 0.012, total + 0.06]} />
        <meshBasicMaterial color="#e8590c" toneMapped={false} />
      </mesh>
      {/* Trays either side for captured pieces. */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[s * 5.36, -0.2, 0]} receiveShadow>
          <boxGeometry args={[1.32, 0.16, 8.2]} />
          <meshStandardMaterial color="#0d0d0d" roughness={0.55} />
        </mesh>
      ))}
      {/* Soft orange glow beneath the suspended board. */}
      <mesh position={[0, -2.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6.5, 64]} />
        <meshBasicMaterial color="#e8590c" transparent opacity={0.07} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Floor({ quality }) {
  return (
    <mesh position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      {quality === 'high' ? (
        <MeshReflectorMaterial
          blur={[300, 80]}
          resolution={512}
          mixBlur={1}
          mixStrength={18}
          roughness={0.85}
          depthScale={0.6}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color="#0a0a0a"
          metalness={0.6}
          mirror={0.4}
        />
      ) : (
        <meshStandardMaterial color="#0b0b0b" roughness={0.35} metalness={0.5} />
      )}
    </mesh>
  );
}

function Interaction({ game, reduced, controlsRef }) {
  const { camera, gl } = useThree();
  const [selected, setSelected] = useState(null);
  const [drag, setDrag] = useState(null); // { id, pos }
  const dragRef = useRef(null);

  // Clear the selection whenever the position changes.
  const [fenSeen, setFenSeen] = useState(game.fen);
  if (fenSeen !== game.fen) {
    setFenSeen(game.fen);
    setSelected(null);
  }

  const info = game.targetsInfo(selected);
  const targets = info.map((t) => t.to);
  const pieceAt = (sq) => game.pieces.find((p) => !p.captured && p.square === sq);
  const canMove = (p) => game.humanTurn && p.color === game.turn;

  const clickSquare = (sq) => {
    if (!sq) return;
    if (selected && targets.includes(sq)) {
      game.tryMove(selected, sq);
      setSelected(null);
      return;
    }
    const p = pieceAt(sq);
    setSelected(p && canMove(p) && sq !== selected ? sq : null);
  };

  const ray = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const pointOnBoard = (clientX, clientY) => {
    const r = gl.domElement.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1), camera);
    return ray.ray.intersectPlane(plane, hit) ? [hit.x, 0, hit.z] : null;
  };

  const startDrag = (p) => (e) => {
    if (!canMove(p)) return;
    e.stopPropagation();
    if (controlsRef.current) controlsRef.current.enabled = false; // keep the camera still
    const wasSelected = selected === p.square;
    setSelected(p.square);
    dragRef.current = { piece: p, x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, moved: false, wasSelected };

    const move = (ev) => {
      const d = dragRef.current;
      if (!d) return;
      if (!d.moved && Math.hypot(ev.clientX - d.x, ev.clientY - d.y) < 6) return;
      d.moved = true;
      const pt = pointOnBoard(ev.clientX, ev.clientY);
      if (pt) setDrag({ id: d.piece.id, pos: pt });
    };
    const up = (ev) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      if (controlsRef.current) controlsRef.current.enabled = true;
      const d = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!d) return;
      if (d.moved) {
        const pt = pointOnBoard(ev.clientX, ev.clientY);
        const sq = pt && xzToSq(pt[0], pt[2]);
        if (sq && game.legalTargets(d.piece.square).includes(sq)) {
          game.tryMove(d.piece.square, sq);
          setSelected(null);
        }
        // Otherwise the piece simply returns to its square.
      } else if (d.wasSelected) {
        setSelected(null);
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const marks = [];
  if (game.lastMove) {
    marks.push(<SquareMark key="lf" sq={game.lastMove.from} kind="last" />, <SquareMark key="lt" sq={game.lastMove.to} kind="last" />);
  }
  if (game.kingInCheck) marks.push(<SquareMark key="ck" sq={game.kingInCheck} kind="check" />);
  if (selected) marks.push(<SquareMark key="sel" sq={selected} kind="selected" />);
  info.forEach((t) => marks.push(<SquareMark key={`t${t.to}`} sq={t.to} kind={t.capture ? 'capture' : 'move'} />));

  return (
    <group>
      {/* Invisible catcher for clicks on empty squares (ignored after an orbit drag). */}
      <mesh
        position={[0, 0.002, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          if (e.delta > 6) return;
          clickSquare(xzToSq(e.point.x, e.point.z));
        }}
      >
        <planeGeometry args={[8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {marks}
      {game.pieces.map((p) => (
        <Piece
          key={p.id}
          piece={p}
          reduced={reduced}
          selected={!p.captured && selected === p.square}
          dragPos={drag && drag.id === p.id ? drag.pos : null}
          interactive={!p.captured && canMove(p)}
          onPointerDown={startDrag(p)}
          onClick={(e) => {
            if (p.captured || e.delta > 6) return;
            e.stopPropagation();
            if (!canMove(p)) clickSquare(p.square); // captures by clicking the target piece
          }}
        />
      ))}
    </group>
  );
}

export default function ChessScene({ game, view, orientation, resetKey, reduced, quality, onReady }) {
  const controlsRef = useRef(null);
  return (
    <Canvas
      shadows
      dpr={quality === 'high' ? [1, 1.75] : [1, 1.25]}
      camera={{ fov: 38, position: [0, 10.2, 11.2], near: 0.1, far: 120 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        onReady?.();
      }}
    >
      <color attach="background" args={['#070707']} />
      <fog attach="fog" args={['#070707', 16, 42]} />

      <ambientLight intensity={0.22} />
      <hemisphereLight args={['#f4ead8', '#0a0a0a', 0.35]} />
      <directionalLight
        position={[5, 11, 6]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[quality === 'high' ? 2048 : 1024, quality === 'high' ? 2048 : 1024]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      {/* Burnt-orange rim from behind and a cool key from the front. */}
      <pointLight position={[-7, 3.5, -7]} intensity={16} distance={20} color="#e8590c" />
      <pointLight position={[7, 2.5, 7]} intensity={10} distance={18} color="#ffe6c8" />
      {quality === 'high' && (
        <SpotLight
          position={[0, 11, 0]}
          angle={0.42}
          penumbra={0.9}
          distance={16}
          attenuation={13}
          anglePower={5}
          intensity={0}
          opacity={0.1}
          color="#f6e4c8"
        />
      )}

      <Board />
      <Interaction game={game} reduced={reduced} controlsRef={controlsRef} />
      <Floor quality={quality} />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={6}
        maxDistance={40}
        maxPolarAngle={1.36}
        autoRotate={view === 'cinematic' && !reduced}
        autoRotateSpeed={0.35}
      />
      <CameraRig view={view} orientation={orientation} resetKey={resetKey} reduced={reduced} />
    </Canvas>
  );
}
