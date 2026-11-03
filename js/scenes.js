import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const DPR = Math.min(devicePixelRatio || 1, 2);

/* only render when on screen */
function whenVisible(el, cb) {
  let on = false;
  new IntersectionObserver(([e]) => { on = e.isIntersecting; cb(on); }, { rootMargin: "100px" }).observe(el);
  return () => on;
}

function makeRenderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  r.setPixelRatio(DPR);
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  return r;
}

/* =====================================================================
   DISCO BALL — "let's get dumb"
   ===================================================================== */
function discoScene() {
  const canvas = document.getElementById("discoCanvas");
  if (!canvas) return;
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .02).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
  camera.position.set(0, 0, 10);
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    // keep the ball in the upper part of the room on every screen
    const visH = 2 * 10 * Math.tan(THREE.MathUtils.degToRad(15));
    ball.position.y = visH * .2;
    ball.scale.setScalar(Math.min(.72, w / h * .8));
    string.position.y = ball.position.y + 1.4 * ball.scale.y + 3;
  };

  // faceted ball: one colour per tile, red / cream / gold like their poster
  const geo = new THREE.SphereGeometry(1.4, 36, 24).toNonIndexed();
  const cols = new Float32Array(geo.attributes.position.count * 3);
  const pal = [new THREE.Color(0xd9262e), new THREE.Color(0xd9262e), new THREE.Color(0xa8161e), new THREE.Color(0xfff2dc), new THREE.Color(0xf3c873)];
  for (let i = 0; i < cols.length / 3; i += 6) {
    const c = pal[Math.floor(Math.random() * pal.length)];
    for (let k = 0; k < 6 && i + k < cols.length / 3; k++) cols.set([c.r, c.g, c.b], (i + k) * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  geo.computeVertexNormals();
  const ball = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, metalness: .75, roughness: .18, flatShading: true }));
  scene.add(ball);

  const string = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, 6, 6), new THREE.MeshBasicMaterial({ color: 0x222222 }));
  scene.add(string);

  scene.add(new THREE.AmbientLight(0xffffff, .25));
  const l1 = new THREE.PointLight(0xffd7a0, 60, 20); l1.position.set(4, 2, 5); scene.add(l1);
  const l2 = new THREE.PointLight(0xff3b3b, 50, 20); l2.position.set(-4, -1, 4); scene.add(l2);

  // light beams
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xf3c873, transparent: true, opacity: .12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const beams = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(.9, 12, 24, 1, true), beamMat.clone());
    cone.geometry.translate(0, -6, 0);
    cone.rotation.z = (i / 6) * Math.PI * 2;
    cone.rotation.x = .5;
    cone.material.color.set(i % 2 ? 0xf3c873 : 0xff4d4d);
    beams.add(cone);
  }
  ball.add(beams);

  // sparkles
  const N = 160;
  const sp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) sp.set([(Math.random() - .5) * 16, (Math.random() - .5) * 9, (Math.random() - .5) * 4], i * 3);
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  const starTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d");
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(.25, "rgba(255,230,180,.6)"); grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: .16, map: starTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(stars);

  new ResizeObserver(resize).observe(canvas);
  resize();

  let mx = 0;
  addEventListener("pointermove", (e) => (mx = e.clientX / innerWidth - .5), { passive: true });
  const isOn = whenVisible(canvas, () => {});
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime();
    if (!isOn()) return;
    ball.rotation.y = t * (reduced ? 0 : .35);
    ball.rotation.z = Math.sin(t * .6) * .05 + mx * .15;
    beams.rotation.y = -t * .2;
    stars.material.opacity = .55 + Math.sin(t * 3) * .3;
    stars.rotation.z = t * .01;
    renderer.render(scene, camera);
  });
}

try { discoScene(); } catch (e) { console.warn("disco scene failed", e); }
