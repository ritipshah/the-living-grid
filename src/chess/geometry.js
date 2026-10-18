import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Staunton-style pieces turned on a lathe (profiles are [radius, height]
// pairs, in board units where one square = 1). Built once and shared by
// all 32 pieces.

const SEG = 40;
const V = (x, y) => new THREE.Vector2(x, y);

function arc(cx, cy, r, a0, a1, n = 10) {
  const pts = [];
  for (let i = 0; i <= n; i += 1) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push(V(Math.max(0.0001, cx + r * Math.cos(a)), cy + r * Math.sin(a)));
  }
  return pts;
}

// Shared foot: plinth, moulding, rising collar.
const BASE = [V(0.0001, 0), V(0.35, 0), V(0.36, 0.02), V(0.36, 0.06), V(0.33, 0.08), V(0.33, 0.1), V(0.3, 0.12)];

function lathe(points) {
  const g = new THREE.LatheGeometry(points, SEG);
  g.computeVertexNormals();
  return g;
}

function pawn() {
  return lathe([
    ...BASE,
    V(0.24, 0.15), V(0.17, 0.22), V(0.12, 0.33), V(0.1, 0.41), V(0.17, 0.43), V(0.17, 0.46), V(0.1, 0.48),
    ...arc(0, 0.6, 0.13, -Math.PI / 2 + 0.55, Math.PI / 2, 12),
  ]);
}

function rook() {
  const body = lathe([
    ...BASE,
    V(0.26, 0.16), V(0.22, 0.24), V(0.19, 0.5), V(0.21, 0.56), V(0.25, 0.58), V(0.25, 0.76), V(0.18, 0.76),
    V(0.18, 0.68), V(0.0001, 0.68),
  ]);
  // Six merlons around the crown.
  const parts = [body];
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    const m = new THREE.BoxGeometry(0.1, 0.08, 0.08);
    m.translate(0, 0.8, 0.205);
    m.rotateY(a);
    parts.push(m.toNonIndexed());
  }
  return mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)));
}

function bishop() {
  const body = lathe([
    ...BASE,
    V(0.24, 0.16), V(0.16, 0.25), V(0.11, 0.45), V(0.1, 0.55), V(0.18, 0.57), V(0.18, 0.6), V(0.1, 0.62),
    V(0.13, 0.66), V(0.15, 0.73), V(0.14, 0.8), V(0.1, 0.87), V(0.05, 0.91), V(0.0001, 0.92),
  ]);
  const tip = new THREE.SphereGeometry(0.045, 16, 12);
  tip.translate(0, 0.96, 0);
  return mergeGeometries([body.toNonIndexed(), tip.toNonIndexed()]);
}

function queen() {
  const body = lathe([
    ...BASE,
    V(0.26, 0.16), V(0.17, 0.26), V(0.12, 0.52), V(0.11, 0.66), V(0.2, 0.69), V(0.2, 0.72), V(0.12, 0.74),
    V(0.15, 0.8), V(0.21, 0.9), V(0.17, 0.92), V(0.1, 0.94), V(0.0001, 0.96),
  ]);
  const parts = [body.toNonIndexed()];
  for (let i = 0; i < 8; i += 1) {
    const s = new THREE.SphereGeometry(0.028, 10, 8);
    s.translate(0, 0.925, 0.19);
    s.rotateY((i / 8) * Math.PI * 2);
    parts.push(s.toNonIndexed());
  }
  const top = new THREE.SphereGeometry(0.055, 16, 12);
  top.translate(0, 1.0, 0);
  parts.push(top.toNonIndexed());
  return mergeGeometries(parts);
}

function king() {
  const body = lathe([
    ...BASE,
    V(0.27, 0.16), V(0.18, 0.27), V(0.13, 0.56), V(0.12, 0.7), V(0.21, 0.73), V(0.21, 0.76), V(0.13, 0.78),
    V(0.16, 0.86), V(0.2, 0.94), V(0.14, 0.97), V(0.0001, 0.98),
  ]);
  const v = new THREE.BoxGeometry(0.05, 0.2, 0.05);
  v.translate(0, 1.07, 0);
  const h = new THREE.BoxGeometry(0.15, 0.05, 0.05);
  h.translate(0, 1.1, 0);
  return mergeGeometries([body.toNonIndexed(), v.toNonIndexed(), h.toNonIndexed()]);
}

function knight() {
  const base = lathe([...BASE, V(0.25, 0.15), V(0.21, 0.2), V(0.0001, 0.21)]);
  // Side silhouette of the horse's head (x = forward, y = up).
  const s = new THREE.Shape();
  s.moveTo(-0.2, 0.19);
  s.lineTo(0.17, 0.19);
  s.bezierCurveTo(0.14, 0.32, 0.05, 0.4, 0.07, 0.5); // chest into neck
  s.bezierCurveTo(0.12, 0.52, 0.22, 0.5, 0.27, 0.55); // jaw
  s.bezierCurveTo(0.3, 0.6, 0.27, 0.66, 0.2, 0.69); // muzzle
  s.lineTo(0.06, 0.8); // face
  s.lineTo(0.03, 0.87); // ear
  s.lineTo(-0.03, 0.82);
  s.bezierCurveTo(-0.14, 0.8, -0.22, 0.66, -0.21, 0.5); // mane
  s.bezierCurveTo(-0.2, 0.38, -0.24, 0.28, -0.2, 0.19);
  const head = new THREE.ExtrudeGeometry(s, {
    depth: 0.16,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.03,
    bevelSegments: 4,
    curveSegments: 18,
  });
  head.translate(0, 0, -0.08);
  head.rotateY(Math.PI); // shown in profile: White's knights face the queenside, Black's the kingside
  head.computeVertexNormals();
  return mergeGeometries([base.toNonIndexed(), head.toNonIndexed()]);
}

let cache;
export function pieceGeometries() {
  if (!cache) {
    cache = { p: pawn(), r: rook(), n: knight(), b: bishop(), q: queen(), k: king() };
    Object.values(cache).forEach((g) => g.computeVertexNormals());
  }
  return cache;
}

let mats;
export function pieceMaterials() {
  if (!mats) {
    mats = {
      w: new THREE.MeshPhysicalMaterial({
        color: '#e8e1d2',
        roughness: 0.38,
        clearcoat: 0.55,
        clearcoatRoughness: 0.3,
        sheen: 0.4,
        sheenColor: new THREE.Color('#fff4e2'),
      }),
      b: new THREE.MeshPhysicalMaterial({
        color: '#121212',
        roughness: 0.22,
        metalness: 0.15,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
      }),
    };
  }
  return mats;
}

// A board texture with coordinates in the margin.
export function boardTexture() {
  const px = 1024;
  const margin = 0.45; // board units
  const total = 8 + margin * 2;
  const unit = px / total;
  const c = document.createElement('canvas');
  c.width = c.height = px;
  const g = c.getContext('2d');
  g.fillStyle = '#0d0d0d';
  g.fillRect(0, 0, px, px);
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      g.fillStyle = (x + y) % 2 ? '#2a2826' : '#d9d2c5';
      g.fillRect((margin + x) * unit, (margin + y) * unit, unit + 0.5, unit + 0.5);
    }
  }
  g.strokeStyle = '#e8590c';
  g.lineWidth = 2;
  g.strokeRect(margin * unit - 3, margin * unit - 3, 8 * unit + 6, 8 * unit + 6);
  g.fillStyle = '#8f8a82';
  g.font = `500 ${Math.round(unit * 0.26)}px "IBM Plex Mono", ui-monospace, monospace`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  for (let i = 0; i < 8; i += 1) {
    const f = 'abcdefgh'[i];
    g.fillText(f, (margin + i + 0.5) * unit, (margin + 8 + margin / 2) * unit);
    g.fillText(f, (margin + i + 0.5) * unit, (margin / 2) * unit);
    g.fillText(String(8 - i), (margin / 2) * unit, (margin + i + 0.5) * unit);
    g.fillText(String(8 - i), (margin + 8 + margin / 2) * unit, (margin + i + 0.5) * unit);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { tex, total };
}
