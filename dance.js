/* =============================================================
   Never Gonna Give You Up — pixel dance (close-up)
   A chest-up, detailed pixel homage: ginger pompadour, charcoal
   blazer with lapels + buttons over a black/white striped shirt,
   white collar, and a vintage chrome mic on a stand out front.
   Upper-body sway + shoulder bob + fist pumps on a loop.
   Press SPACE (or tap) for the classic "point up" move.

   ?face=<img>  swap a person's photo onto the head
   ?name=<text> personalized caption
   ?hair=1      keep Rick's pompadour on top of the photo
   ?px=N        chunkier face pixels (default crisp)
   ?face=demo   preview the swap with a stand-in face
   ============================================================= */

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
ctx.imageSmoothingEnabled = false;

const UNIT = 4;
const W = canvas.width, H = canvas.height;
const COLS = W / UNIT;   // 90
const ROWS = H / UNIT;   // 65
const CX = 45;           // body center column

/* Palette */
const C = {
  hair:  "#c65d2e", hairHi: "#e88b4a", hairD: "#8f3f1a",
  skin:  "#f1cba1", skinHi: "#f9ddb8", skinD: "#cf9c6d",
  eye:   "#33242c", white: "#f6f0e4", brow: "#8f3f1a", lip: "#b06a52",
  jacket:"#30303f", jacketD:"#1d1d28", jacketHi:"#43435a", button:"#565673",
  shirt: "#f3f0e6", stripe: "#20212b",
  collar:"#ffffff",
  mic:   "#c3c6cd", micHi: "#eef0f4", micD: "#6f7480", stand: "#454852",
  note:  "#4fd6e0",
};

function px(gx, gy, gw, gh, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(gx) * UNIT, Math.round(gy) * UNIT, gw * UNIT, gh * UNIT);
}

/* ---- face swap ---------------------------------------------------------- */
const params = new URLSearchParams(location.search);
const faceSrc = params.get("face");
const personName = params.get("name");
const rickHairOnTop = params.get("hair") === "1";
const demoFace = faceSrc === "demo";
const faceBlock = Math.max(1, parseInt(params.get("px") || "1", 10));

// Absolute head box (grid cells) a photo is fitted into. Center = CX.
const HEAD = { x: 34, y: 2, w: 22, h: 23 };

let faceImg = null, faceReady = false;
if (faceSrc && !demoFace) {
  faceImg = new Image();
  faceImg.crossOrigin = "anonymous";
  faceImg.onload = () => { faceReady = true; };
  faceImg.onerror = () => { faceReady = false; };
  faceImg.src = faceSrc;
}
const faceBuf = document.createElement("canvas");
const fctx = faceBuf.getContext("2d");

function headClip(x, y, w, h) {
  const rt = Math.round(w * 0.44), rb = Math.round(w * 0.30);
  ctx.beginPath();
  ctx.moveTo(x + rt, y);
  ctx.lineTo(x + w - rt, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rt);
  ctx.lineTo(x + w, y + h - rb);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rb, y + h);
  ctx.lineTo(x + rb, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rb);
  ctx.lineTo(x, y + rt);
  ctx.quadraticCurveTo(x, y, x + rt, y);
  ctx.closePath();
  ctx.clip();
}

function drawPhotoFace() {
  const bx = HEAD.x * UNIT, by = HEAD.y * UNIT, bw = HEAD.w * UNIT, bh = HEAD.h * UNIT;
  const ar = faceImg.width / faceImg.height, tar = bw / bh;
  let sx, sy, sw2, sh2;
  if (ar > tar) { sh2 = faceImg.height; sw2 = sh2 * tar; sx = (faceImg.width - sw2) / 2; sy = 0; }
  else { sw2 = faceImg.width; sh2 = sw2 / tar; sx = 0; sy = (faceImg.height - sh2) / 2; }

  ctx.save();
  headClip(bx, by, bw, bh);
  if (faceBlock <= 1) {
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(faceImg, sx, sy, sw2, sh2, bx, by, bw, bh);
    ctx.imageSmoothingEnabled = false;
  } else {
    const dw = Math.max(1, Math.round(bw / faceBlock)), dh = Math.max(1, Math.round(bh / faceBlock));
    faceBuf.width = dw; faceBuf.height = dh;
    fctx.imageSmoothingEnabled = true;
    fctx.clearRect(0, 0, dw, dh);
    fctx.drawImage(faceImg, sx, sy, sw2, sh2, 0, 0, dw, dh);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(faceBuf, 0, 0, dw, dh, bx, by, bw, bh);
  }
  ctx.restore();
}

function drawDemoFace() {
  const x = HEAD.x, y = HEAD.y;
  px(x + 3, y + 1, 16, 4, "#5a3a22");           // hair
  px(x + 1, y + 3, 2, 10, "#5a3a22");
  px(x + 19, y + 3, 2, 10, "#5a3a22");
  px(x + 3, y + 4, 16, 16, "#e8b98f");          // face
  px(x + 6, y + 9, 3, 2, "#2a2030");            // eyes
  px(x + 13, y + 9, 3, 2, "#2a2030");
  px(x + 10, y + 12, 2, 2, "#c98a6a");          // nose
  px(x + 8, y + 16, 6, 1, "#8a5a3a");           // smile
}

/* ---- Rick's hand-drawn head -------------------------------------------- */
// Ginger pompadour that caps a photo head (used with ?hair=1).
function drawPompadourCap() {
  const x = HEAD.x, y = HEAD.y;
  px(x + 5, y + 0, 12, 1, C.hair);              // crown (within the head silhouette)
  px(x + 3, y + 1, 16, 3, C.hair);              // hair mass
  px(x + 2, y + 3, 18, 2, C.hair);              // over forehead
  px(x + 6, y + 0, 9, 1, C.hairHi);             // crest highlight
  px(x + 13, y + 0, 5, 2, C.hair);              // swept quiff (kept low)
  px(x + 15, y + 0, 3, 1, C.hairHi);
  px(x + 2, y + 3, 2, 7, C.hair);               // left sideburn
  px(x + 18, y + 3, 2, 6, C.hair);              // right sideburn
  px(x + 2, y + 3, 1, 5, C.hairD);
  px(x + 2, y + 4, 18, 1, C.hairD);             // hairline shadow
}

function drawRickHead() {
  const x = HEAD.x, y = HEAD.y;               // 34,2 ; face roughly cols 37..52
  // hair mass
  px(x + 3, y + 1, 16, 4, C.hair);
  px(x + 5, y + 1, 10, 1, C.hairHi);            // crest highlight
  px(x + 15, y - 1, 6, 3, C.hair);              // quiff peak
  px(x + 17, y + 0, 3, 1, C.hairHi);
  px(x + 2, y + 4, 3, 9, C.hair);               // left sideburn
  px(x + 17, y + 4, 3, 8, C.hair);              // right sideburn
  px(x + 3, y + 4, 1, 8, C.hairD);
  // face
  px(x + 4, y + 4, 14, 16, C.skin);
  px(x + 4, y + 5, 14, 1, C.skinHi);            // forehead sheen
  px(x + 3, y + 5, 1, 12, C.skinD);             // left face shade
  px(x + 2, y + 11, 2, 4, C.skin);              // left ear
  px(x + 18, y + 11, 2, 4, C.skin);             // right ear
  px(x + 4, y + 5, 14, 1, C.hairD);             // hairline shadow
  // brows
  px(x + 5, y + 8, 4, 1, C.brow);
  px(x + 13, y + 8, 4, 1, C.brow);
  // eyes (sclera + pupil)
  px(x + 5, y + 9, 4, 2, C.white);
  px(x + 13, y + 9, 4, 2, C.white);
  px(x + 6, y + 9, 2, 2, C.eye);
  px(x + 14, y + 9, 2, 2, C.eye);
  // nose
  px(x + 10, y + 11, 2, 3, C.skin);
  px(x + 10, y + 13, 3, 1, C.skinD);
  // mouth + jaw
  px(x + 8, y + 16, 6, 1, C.lip);
  px(x + 5, y + 18, 12, 1, C.skinD);            // jaw shadow
  px(x + 7, y + 19, 8, 1, C.skinD);             // chin
}

function drawHead() {
  if (faceReady) {
    drawPhotoFace();
    if (rickHairOnTop) drawPompadourCap();
  } else if (demoFace) {
    drawDemoFace();
  } else {
    drawRickHead();
  }
}

/* ---- torso: blazer, collar, striped shirt, buttons --------------------- */
function drawTorso() {
  // neck
  px(41, 22, 8, 4, C.skin);
  px(41, 24, 8, 1, C.skinD);
  // jacket shoulders + body
  px(24, 26, 42, 7, C.jacket);                  // broad shoulders
  px(27, 32, 36, 33, C.jacket);                 // body to bottom of frame
  px(24, 26, 3, 39, C.jacketD);                 // left shade
  px(61, 26, 2, 39, C.jacketHi);                // right sheen
  // white shirt collar
  px(38, 25, 5, 3, C.collar);
  px(47, 25, 5, 3, C.collar);
  px(40, 28, 3, 2, C.collar);
  px(47, 28, 3, 2, C.collar);
  // striped shirt V (cols 39..51), stripes behind the mic
  for (let r = 0; r < 17; r++) {
    px(39, 28 + r, 13, 1, r % 2 === 0 ? C.stripe : C.shirt);
  }
  // lapels — diagonal edges framing the shirt V
  for (let i = 0; i < 6; i++) {
    px(37 - i, 28 + i * 3, 3, 3, C.jacket);      // left lapel steps out+down
    px(51 + i, 28 + i * 3, 3, 3, C.jacket);      // right lapel
    px(39 - i, 28 + i * 3, 1, 3, C.jacketHi);    // lapel highlight edge
    px(51 + i, 28 + i * 3, 1, 3, C.jacketHi);
  }
  // double-breasted buttons
  for (let b = 0; b < 3; b++) {
    px(40, 48 + b * 5, 2, 2, C.button);
    px(49, 48 + b * 5, 2, 2, C.button);
  }
}

/* ---- arms / fists ------------------------------------------------------- */
function fistArm(fy, side) {
  const flip = (x, w) => (side === 1 ? x : COLS - x - w);
  px(flip(24, 9), 27, 9, 6, C.jacket);          // shoulder pad
  px(flip(24, 8), 32, 8, 14, C.jacket);         // upper sleeve
  px(flip(24, 2), 32, 2, 14, side === 1 ? C.jacketD : C.jacketHi);
  px(flip(26, 7), fy - 6, 7, 7, C.jacket);      // forearm
  px(flip(27, 6), fy - 1, 6, 1, C.jacketD);     // cuff
  px(flip(27, 6), fy, 6, 5, C.skin);            // fist
  px(flip(27, 6), fy + 1, 6, 1, C.skinD);       // knuckles
  px(flip(31, 2), fy + 1, 2, 3, C.skin);        // thumb
}

function pointArm() {
  px(57, 27, 9, 6, C.jacket);                   // shoulder
  px(58, 17, 7, 14, C.jacket);                  // upper arm rising
  px(58, 17, 2, 14, C.jacketD);
  px(60, 5, 6, 13, C.jacket);                   // forearm up
  px(61, 2, 5, 5, C.skin);                      // hand
  px(62, 0, 2, 3, C.skin);                      // finger to the sky
}

function drawArms(pose) {
  if (pose === "point") {
    fistArm(52, 1);
    pointArm();
    return;
  }
  const fy = pose === "up" ? 47 : pose === "down" ? 55 : 52;
  fistArm(fy, 1);
  fistArm(fy, -1);
}

/* ---- the mic on its stand (fixed, out front) --------------------------- */
function drawMic() {
  const hx = 42, hy = 29, hw = 6, hh = 17;      // chrome head
  // stand pole
  px(CX - 1, hy + hh, 2, ROWS - (hy + hh), C.stand);
  // yoke arms
  px(hx - 2, hy + 3, 1, 9, C.stand);
  px(hx + hw + 1, hy + 3, 1, 9, C.stand);
  // head frame + chrome face
  px(hx - 1, hy - 1, hw + 2, hh + 2, C.micD);
  px(hx, hy, hw, hh, C.mic);
  px(hx, hy, hw, 1, C.micHi);                   // top highlight
  px(hx, hy, 1, hh, C.micHi);                   // left highlight
  // grille mesh lines
  for (let r = 2; r < hh; r += 2) px(hx, hy + r, hw, 1, C.micD);
}

/* ---- floating musical notes -------------------------------------------- */
const notes = [];
function spawnNote() {
  notes.push({
    x: CX + (Math.random() * 22 - 11),
    y: 3,
    vy: 0.12 + Math.random() * 0.1,
    drift: (Math.random() - 0.5) * 0.12,
    life: 0,
    max: 90 + Math.random() * 40,
    glyph: Math.random() > 0.5 ? "♪" : "♫",
  });
}
function drawNotes() {
  for (const n of notes) {
    ctx.globalAlpha = Math.max(0, 1 - n.life / n.max);
    ctx.fillStyle = C.note;
    ctx.font = `${UNIT * 4}px "Press Start 2P", monospace`;
    ctx.fillText(n.glyph, n.x * UNIT, n.y * UNIT);
    ctx.globalAlpha = 1;
  }
}

/* ---- background: warm sky + spotlight ---------------------------------- */
function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#ffd59e");
  g.addColorStop(0.55, "#ff9d6f");
  g.addColorStop(1, "#c76b8e");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const s = ctx.createRadialGradient(W * 0.5, H * 0.26, 8, W * 0.5, H * 0.26, 170);
  s.addColorStop(0, "rgba(255,248,232,0.9)");
  s.addColorStop(1, "rgba(255,248,232,0)");
  ctx.fillStyle = s;
  ctx.fillRect(0, 0, W, H);
}

/* ---- main loop ---------------------------------------------------------- */
const FRAMES = [
  { arm: "guard", bob: 0,  lean: 0 },
  { arm: "up",    bob: -1, lean: -1 },
  { arm: "guard", bob: 0,  lean: 0 },
  { arm: "down",  bob: -1, lean: 1 },
];
const FRAME_MS = 180;
let frameIndex = 0, lastStep = 0, noteTimer = 0, pointing = 0;

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const IDLE_STATUS = personName ? `♪ ${personName} · never gonna give you up ♪` : "♪ dancing ♪";
statusEl.textContent = IDLE_STATUS;

function loop(t) {
  drawBackground();

  if (!reduced && t - lastStep > FRAME_MS) {
    frameIndex = (frameIndex + 1) % FRAMES.length;
    lastStep = t;
  }
  const f = reduced ? FRAMES[0] : FRAMES[frameIndex];
  const isPoint = pointing > 0 && !reduced;
  const lean = isPoint ? 0 : f.lean;
  const bob = isPoint ? -1 : f.bob;

  // upper body sways/bobs; mic stays fixed out front
  ctx.save();
  ctx.translate(Math.round(lean) * UNIT, Math.round(bob) * UNIT);
  drawHead();
  drawTorso();
  drawArms(isPoint ? "point" : f.arm);
  ctx.restore();

  drawMic();

  if (isPoint) {
    pointing -= 1;
    if (pointing === 0) statusEl.textContent = IDLE_STATUS;
  }

  if (!reduced) {
    noteTimer += 1;
    if (noteTimer > 45) { spawnNote(); noteTimer = 0; }
  }
  for (let i = notes.length - 1; i >= 0; i--) {
    const n = notes[i];
    n.y -= n.vy; n.x += n.drift; n.life += 1;
    if (n.life > n.max) notes.splice(i, 1);
  }
  drawNotes();

  requestAnimationFrame(loop);
}

/* ---- interaction: SPACE / tap = point to the sky ----------------------- */
function triggerPoint() {
  if (reduced) return;
  pointing = 16;
  statusEl.textContent = "♪ never gonna ↑ ♪";
  for (let i = 0; i < 5; i++) spawnNote();
}
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); triggerPoint(); }
});
canvas.addEventListener("pointerdown", triggerPoint);

requestAnimationFrame(loop);
