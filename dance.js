/* =============================================================
   Never Gonna Give You Up — pixel dance
   A stylized pixel-art homage modelled on the iconic video look:
   ginger pompadour, dark blazer over a black-and-white striped
   shirt with a white collar, and a vintage mic on a stand out
   front. He does the side-to-side two-step / sway on a loop.
   Press SPACE (or tap) for the classic "point up" move.
   No lyrics, no audio — just the moves.
   ============================================================= */

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
ctx.imageSmoothingEnabled = false;

/* ---- pixel grid ---------------------------------------------------------
   Finer grid than before (UNIT 4) so the figure carries more detail.
   UNIT = size of one "pixel" in canvas backing pixels.                     */
const UNIT = 4;
const COLS = canvas.width / UNIT;   // 90
const ROWS = canvas.height / UNIT;  // 65

/* Palette — tuned to the video: ginger hair, charcoal blazer,
   black/white striped shirt, silver ribbon mic. */
const C = {
  hair:  "#c65d2e", hairHi: "#e88b4a", hairD: "#8f3f1a",
  skin:  "#f1cba1", skinD:  "#d3a273",
  eye:   "#332630", brow: "#8f3f1a",
  jacket:"#30303f", jacketD:"#1e1e29", jacketHi:"#3f3f52",
  shirt: "#f3f0e6", stripe: "#22232d",   // striped shirt
  collar:"#ffffff",
  trouser:"#26262f", trouserD:"#181820",
  shoe:  "#131318",
  mic:   "#c3c6cd", micHi: "#eef0f4", micD: "#7c808c", stand: "#4a4d57",
  note:  "#4fd6e0",
};

/* one grid cell */
function px(gx, gy, gw, gh, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(gx) * UNIT, Math.round(gy) * UNIT, gw * UNIT, gh * UNIT);
}

/* ---- face swap ----------------------------------------------------------
   ?face=<image url>  -> composite that person's face onto the head
   ?name=<text>       -> caption under the credits
   ?hair=1            -> also slap Rick's pompadour on top of the photo
   ?face=demo         -> a stand-in cartoon face (proves compositing)      */
const params = new URLSearchParams(location.search);
const faceSrc = params.get("face");
const personName = params.get("name");
const rickHairOnTop = params.get("hair") === "1";
const demoFace = faceSrc === "demo";

// The head box (relative grid cells) that a photo is fitted into.
const HEAD = { x: 1, y: 3, w: 9, h: 10 };

let faceImg = null, faceReady = false;
if (faceSrc && !demoFace) {
  faceImg = new Image();
  faceImg.crossOrigin = "anonymous";
  faceImg.onload = () => { faceReady = true; };
  faceImg.onerror = () => { faceReady = false; };
  faceImg.src = faceSrc;
}

// Offscreen buffer used to downsample the photo into chunky pixels.
const faceBuf = document.createElement("canvas");
const fctx = faceBuf.getContext("2d");

// Pixelation: ?px=1 (default) draws the photo crisp; higher = chunkier.
const faceBlock = Math.max(1, parseInt(params.get("px") || "1", 10));

/* Draw the loaded photo into the head box. Crisp by default; ?px>=2 gives a
   chunky, art-matching downsample.                                         */
function drawPhotoFace(ax, ay) {
  const bx = (ax + HEAD.x) * UNIT, by = (ay + HEAD.y) * UNIT;
  const bw = HEAD.w * UNIT, bh = HEAD.h * UNIT;
  // cover-fit source rect (crop the photo to the head box aspect ratio)
  const ar = faceImg.width / faceImg.height, tar = bw / bh;
  let sx, sy, sSize, sw2, sh2;
  if (ar > tar) { sh2 = faceImg.height; sw2 = sh2 * tar; sx = (faceImg.width - sw2) / 2; sy = 0; }
  else { sw2 = faceImg.width; sh2 = sw2 / tar; sx = 0; sy = (faceImg.height - sh2) / 2; }

  if (faceBlock <= 1) {
    ctx.imageSmoothingEnabled = true;               // crisp
    ctx.drawImage(faceImg, sx, sy, sw2, sh2, bx, by, bw, bh);
    ctx.imageSmoothingEnabled = false;
    return;
  }
  const dw = Math.max(1, Math.round(bw / faceBlock));
  const dh = Math.max(1, Math.round(bh / faceBlock));
  faceBuf.width = dw; faceBuf.height = dh;
  fctx.imageSmoothingEnabled = true;
  fctx.clearRect(0, 0, dw, dh);
  fctx.drawImage(faceImg, sx, sy, sw2, sh2, 0, 0, dw, dh);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(faceBuf, 0, 0, dw, dh, bx, by, bw, bh);
}

/* A stand-in face so the swap can be previewed with no asset.              */
function drawDemoFace(ax, ay) {
  const x = ax + HEAD.x, y = ay + HEAD.y;
  px(x + 1, y + 0, 7, 2, "#5a3a22");        // hair
  px(x + 0, y + 1, 1, 5, "#5a3a22");
  px(x + 8, y + 1, 1, 5, "#5a3a22");
  px(x + 1, y + 2, 7, 8, "#e8b98f");        // face
  px(x + 2, y + 4, 1, 1, "#2a2030");        // eyes
  px(x + 6, y + 4, 1, 1, "#2a2030");
  px(x + 4, y + 6, 1, 1, "#c98a6a");        // nose
  px(x + 3, y + 8, 3, 1, "#8a5a3a");        // smile
}

/* ---- the character ------------------------------------------------------
   Body origin (OX, OY) = top-left of the hair. CENTER = body's vertical
   axis, which the standing mic and the mirror() helper both key off.       */
const OX = 40;
const OY = 6;
const CENTER = OX + 5;

/* Mirror a list of rects across the body's center line.                    */
function mirror(rects) {
  return rects.map(([x, y, w, h, col]) => [2 * CENTER - x - w, y, w, h, col]);
}

/* ---- arm poses (rect lists, relative grid coords) -----------------------
   Both arms hang in relaxed fists at the sides — the "dance-ready" guard
   from the video. Authored for his RIGHT arm and mirrored for his left, so
   the shoulders stay broad and symmetric. The groove is body sway +
   two-step; armsPump lifts the fists a touch on the off-beats.             */
const armR = [
  [OX - 2, OY + 15, 3, 2, C.jacket],                 // broad shoulder pad
  [OX - 2, OY + 16, 2, 8, C.jacket], [OX - 2, OY + 16, 1, 8, C.jacketD],
  [OX - 1, OY + 23, 2, 3, C.jacket],                 // forearm
  [OX - 1, OY + 26, 2, 2, C.skin],                   // fist (pokes out)
];
const armsGuard = [...armR, ...mirror(armR)];

// Off-beat: fists lifted and drawn in toward the mic.
const armRpump = [
  [OX - 2, OY + 15, 3, 2, C.jacket],
  [OX - 2, OY + 16, 2, 6, C.jacket], [OX - 2, OY + 16, 1, 6, C.jacketD],
  [OX + 0, OY + 21, 2, 3, C.jacket],
  [OX + 1, OY + 22, 2, 2, C.skin],
];
const armsPump = [...armRpump, ...mirror(armRpump)];

// One-shot: right fist stays low, left arm thrown up to point at the sky.
const armsPoint = [
  ...armR,
  // his left arm (viewer right) thrown up
  [OX + 9, OY + 14, 2, 2, C.jacket],
  [OX + 10, OY + 10, 2, 4, C.jacket],
  [OX + 11, OY + 6, 2, 4, C.jacketHi],
  [OX + 12, OY + 3, 2, 3, C.jacket],
  [OX + 13, OY + 2, 1, 1, C.skin],   // pointing finger
];

/* ---- leg poses (thick trousers, symmetric about CENTER) ----------------- */
const legsNeutral = [
  [OX + 1, OY + 31, 4, 11, C.trouser], [OX + 1, OY + 31, 1, 11, C.trouserD],
  [OX + 6, OY + 31, 4, 11, C.trouser], [OX + 8, OY + 31, 1, 11, C.trouserD],
  [OX + 0, OY + 42, 5, 2, C.shoe],
  [OX + 6, OY + 42, 5, 2, C.shoe],
];

// Two-step: weight on the left leg, right foot lifts.
const legsStepL = [
  [OX + 1, OY + 31, 4, 11, C.trouser], [OX + 1, OY + 31, 1, 11, C.trouserD],
  [OX + 6, OY + 31, 4, 9, C.trouser], [OX + 8, OY + 31, 1, 9, C.trouserD],
  [OX + 0, OY + 42, 5, 2, C.shoe],
  [OX + 6, OY + 40, 5, 2, C.shoe],
];
const legsStepR = mirror(legsStepL);

/* The dance loop. bob = vertical bounce (cells), lean = horizontal sway.   */
const FRAMES = [
  { arms: armsGuard, legs: legsNeutral, bob: 0,  lean: 0 },
  { arms: armsPump,  legs: legsStepL,   bob: -1, lean: -1 },
  { arms: armsGuard, legs: legsNeutral, bob: 0,  lean: 0 },
  { arms: armsPump,  legs: legsStepR,   bob: -1, lean: 1 },
];

/* Draw the head + torso. Accepts a bob/lean offset so the upper body
   grooves while the feet stay planted.                                     */
// Rick's hand-drawn ginger pompadour (center = ax+5).
function drawRickHair(ax, ay) {
  px(ax + 2, ay + 0, 6, 1, C.hairHi);      // crest highlight
  px(ax + 1, ay + 1, 8, 2, C.hair);        // main volume
  px(ax + 7, ay + 0, 3, 2, C.hair);        // front quiff (up-right)
  px(ax + 1, ay + 3, 8, 1, C.hair);        // hair band over forehead
  px(ax + 1, ay + 3, 1, 4, C.hair);        // left side / sideburn
  px(ax + 8, ay + 3, 1, 3, C.hair);        // right side
  px(ax + 1, ay + 1, 1, 5, C.hairD);       // left shadow
  px(ax + 8, ay + 1, 1, 2, C.hairD);       // crown shadow
}

// Rick's hand-drawn face + neck.
function drawRickFace(ax, ay) {
  px(ax + 2, ay + 4, 7, 8, C.skin);
  px(ax + 1, ay + 7, 1, 2, C.skin);        // left ear
  px(ax + 9, ay + 7, 1, 2, C.skin);        // right ear
  px(ax + 3, ay + 6, 1, 1, C.brow);        // brows (light)
  px(ax + 7, ay + 6, 1, 1, C.brow);
  px(ax + 3, ay + 7, 1, 1, C.eye);         // eyes
  px(ax + 7, ay + 7, 1, 1, C.eye);
  px(ax + 5, ay + 9, 1, 1, C.skinD);       // nose
  px(ax + 4, ay + 10, 2, 1, C.eye);        // small mouth
  px(ax + 4, ay + 11, 3, 1, C.skinD);      // chin shadow
  px(ax + 4, ay + 12, 3, 2, C.skin);       // neck
  px(ax + 4, ay + 13, 3, 1, C.skinD);
}

function drawUpper(dx, dy) {
  const ax = OX + dx, ay = OY + dy;

  // ---- head: swapped-in face, demo face, or Rick's drawn face ----
  if (faceReady) {
    drawPhotoFace(ax, ay);
    if (rickHairOnTop) drawRickHair(ax, ay);
  } else if (demoFace) {
    drawDemoFace(ax, ay);
  } else {
    drawRickHair(ax, ay);
    drawRickFace(ax, ay);
  }

  // ---- jacket torso (core, cols 0..10, center ax+5) ----
  px(ax + 1, ay + 14, 9, 1, C.jacket);     // shoulder slope
  px(ax + 0, ay + 15, 11, 17, C.jacket);
  px(ax + 0, ay + 15, 2, 17, C.jacketD);   // inner shading
  // white collar V
  px(ax + 2, ay + 13, 3, 2, C.collar);
  px(ax + 6, ay + 13, 3, 2, C.collar);
  // black/white striped shirt panel between the lapels (cols 3..7)
  for (let r = 0; r < 13; r++) {
    px(ax + 3, ay + 15 + r, 5, 1, r % 2 === 0 ? C.stripe : C.shirt);
  }
  // lapel edges over the shirt
  px(ax + 2, ay + 15, 1, 13, C.jacketD);
  px(ax + 8, ay + 15, 1, 13, C.jacketHi);
}

/* The vintage ribbon mic on its stand, out front and centered. Fixed in
   the world (no bob/lean) so he sways behind it.                           */
function drawMic() {
  const mx = CENTER;
  const top = OY + 15;
  // yoke arms holding the head
  px(mx - 2, top + 1, 1, 7, C.stand);
  px(mx + 2, top + 1, 1, 7, C.stand);
  // rectangular head (cols mx-1..mx+1)
  px(mx - 1, top, 3, 9, C.micD);
  px(mx - 1, top + 1, 3, 7, C.mic);
  px(mx - 1, top + 1, 3, 1, C.micHi);      // top highlight
  px(mx - 1, top + 1, 1, 7, C.micHi);      // left highlight
  px(mx - 1, top + 3, 3, 1, C.micD);       // grille lines
  px(mx - 1, top + 5, 3, 1, C.micD);
  // pole down and out of frame, between the feet
  px(mx, top + 9, 1, ROWS - (top + 9), C.stand);
}

function drawRects(list, dx, dy) {
  for (const [x, y, w, h, col] of list) px(x + dx, y + dy, w, h, col);
}

/* ---- floating musical notes -------------------------------------------- */
const notes = [];
function spawnNote() {
  notes.push({
    x: CENTER + (Math.random() * 10 - 5),
    y: OY + 2,
    vy: 0.15 + Math.random() * 0.1,
    drift: (Math.random() - 0.5) * 0.12,
    life: 0,
    max: 90 + Math.random() * 40,
    glyph: Math.random() > 0.5 ? "♪" : "♫",
  });
}
function drawNotes() {
  for (const n of notes) {
    const alpha = Math.max(0, 1 - n.life / n.max);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = C.note;
    ctx.font = `${UNIT * 4}px "Press Start 2P", monospace`;
    ctx.fillText(n.glyph, n.x * UNIT, n.y * UNIT);
    ctx.globalAlpha = 1;
  }
}

/* ---- background --------------------------------------------------------- */
function drawBackground(t) {
  // dusk sky gradient
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, "#ffd59e");
  g.addColorStop(0.5, "#ff9d6f");
  g.addColorStop(1, "#c76b8e");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // soft sun
  ctx.fillStyle = "rgba(255,244,226,0.85)";
  ctx.beginPath();
  ctx.arc(canvas.width * 0.5, canvas.height * 0.32, 60, 0, Math.PI * 2);
  ctx.fill();

  // brick wall band
  const wallTop = 36;
  px(0, wallTop, COLS, 13, "#a8523f");
  ctx.fillStyle = "rgba(0,0,0,0.14)";
  for (let r = 0; r < 13; r++) {
    const off = r % 2 ? UNIT * 3 : 0;
    for (let bx = -2; bx < COLS + 2; bx += 6) {
      ctx.fillRect((bx * UNIT) + off, (wallTop + r) * UNIT, UNIT * 0.4, UNIT);
    }
    ctx.fillRect(0, (wallTop + r) * UNIT + UNIT - 1, canvas.width, 1);
  }

  // checkered dance floor
  const floorTop = 49;
  for (let ry = floorTop; ry < ROWS; ry++) {
    for (let cx = 0; cx < COLS; cx++) {
      const shift = Math.floor(t / 500) % 2;
      const dark = (cx + ry + shift) % 2 === 0;
      px(cx, ry, 1, 1, dark ? "#2b2340" : "#4a3c66");
    }
  }
}

/* ---- main loop ---------------------------------------------------------- */
const FRAME_MS = 170;
let frameIndex = 0;
let lastStep = 0;
let noteTimer = 0;

// one-shot "point" move
let pointing = 0;

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Idle caption — personalized when a ?name= is supplied.
const IDLE_STATUS = personName ? `♪ ${personName} · never gonna give you up ♪` : "♪ dancing ♪";
statusEl.textContent = IDLE_STATUS;

function loop(t) {
  drawBackground(t);

  // advance dance frame
  if (!reduced && t - lastStep > FRAME_MS) {
    frameIndex = (frameIndex + 1) % FRAMES.length;
    lastStep = t;
  }
  const f = reduced ? FRAMES[0] : FRAMES[frameIndex];

  // feet stay planted; upper body + arms get the bob/lean
  drawRects(f.legs, 0, 0);

  if (pointing > 0 && !reduced) {
    drawUpper(0, -1);
    drawRects(armsPoint, 0, -1);
    pointing -= 1;
    if (pointing === 0) statusEl.textContent = IDLE_STATUS;
  } else {
    drawUpper(f.lean, f.bob);
    drawRects(f.arms, f.lean, f.bob);
  }

  drawMic();   // mic stand sits out front, fixed

  // notes
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

/* ---- interaction: SPACE / tap = point to the sky ------------------------ */
function triggerPoint() {
  if (reduced) return;
  pointing = 14; // ~2.4s
  statusEl.textContent = "♪ never gonna ↑ ♪";
  for (let i = 0; i < 4; i++) spawnNote();
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); triggerPoint(); }
});
canvas.addEventListener("pointerdown", triggerPoint);

requestAnimationFrame(loop);
