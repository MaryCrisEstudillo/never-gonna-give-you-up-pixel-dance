/* =============================================================
   Never Gonna Give You Up — pixel dance
   A stylized pixel-art homage. He does the signature side-to-side
   arm-swing / two-step on a loop. Press SPACE (or tap) to make him
   throw the classic "point up" move.
   No lyrics, no audio — just the moves.
   ============================================================= */

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
ctx.imageSmoothingEnabled = false;

/* ---- pixel grid ---------------------------------------------------------
   We draw on a coarse grid so everything reads as chunky pixel art.
   UNIT = size of one "pixel" in canvas backing pixels.                     */
const UNIT = 6;
const COLS = canvas.width / UNIT;   // 60
const ROWS = canvas.height / UNIT;  // ~43

/* Palette */
const C = {
  hair:  "#e8802b", hairD: "#c25f11",
  skin:  "#f3c99b", skinD: "#d8a06e",
  eye:   "#241a2b",
  coat:  "#dcc190", coatD: "#bd9d63",
  collar:"#f6f1e4",
  jean:  "#3b4b7a", jeanD: "#2b3860",
  shoe:  "#20202c",
  note:  "#4fd6e0",
};

/* one grid cell */
function px(gx, gy, gw, gh, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(gx) * UNIT, Math.round(gy) * UNIT, gw * UNIT, gh * UNIT);
}

/* ---- the character ------------------------------------------------------
   Body origin (ox, oy) = top-left of the head area. The figure is ~14 cols
   wide and ~24 tall. Feet rest near row 40. Center column = ox + 7.        */
const OX = 23;
const OY = 16;
const CENTER = OX + 7;

/* Mirror a list of rects across the body's vertical center line.
   Used to derive the right-swing pose from the left-swing pose.            */
function mirror(rects) {
  return rects.map(([x, y, w, h, col]) => [2 * CENTER - x - w, y, w, h, col]);
}

/* Arms & legs as rect lists (relative grid coords). */
const armsNeutral = [
  // his right arm (viewer left)
  [OX + 1, OY + 10, 2, 4, C.coat], [OX + 1, OY + 14, 2, 1, C.skin],
  // his left arm (viewer right)
  [OX + 11, OY + 10, 2, 4, C.coat], [OX + 11, OY + 14, 2, 1, C.skin],
];

const legsNeutral = [
  [OX + 4, OY + 18, 2, 3, C.jean], [OX + 3, OY + 21, 3, 1, C.shoe],
  [OX + 8, OY + 18, 2, 3, C.jean], [OX + 8, OY + 21, 3, 1, C.shoe],
];

// Both arms swung to the viewer-left, stacked on a downward diagonal.
const armsSwingL = [
  [OX + 1, OY + 9, 2, 2, C.coat],
  [OX - 1, OY + 10, 2, 2, C.coat],
  [OX - 3, OY + 11, 2, 2, C.coatD],
  [OX - 4, OY + 12, 2, 1, C.skin],
  // second arm just behind
  [OX + 2, OY + 11, 2, 2, C.coat],
  [OX + 0, OY + 12, 2, 2, C.coat],
  [OX - 2, OY + 13, 2, 1, C.skin],
];

// Two-step: weight to the left, trailing leg crossed/lifted.
const legsStepL = [
  [OX + 3, OY + 18, 2, 3, C.jean], [OX + 2, OY + 21, 3, 1, C.shoe],
  [OX + 6, OY + 18, 2, 2, C.jean], [OX + 6, OY + 20, 3, 1, C.shoe],
];

const armsSwingR = mirror(armsSwingL);
const legsStepR  = mirror(legsStepL);

// Special one-shot: the iconic point to the sky.
const armsPoint = [
  // right arm tucked to chest
  [OX + 3, OY + 11, 2, 3, C.coat], [OX + 3, OY + 14, 2, 1, C.skin],
  // left arm thrown up and out
  [OX + 11, OY + 8, 2, 2, C.coat],
  [OX + 12, OY + 6, 2, 2, C.coat],
  [OX + 13, OY + 4, 2, 2, C.coatD],
  [OX + 14, OY + 3, 1, 1, C.skin],  // pointing hand
];

/* The dance loop. bob = vertical bounce (cells), lean = horizontal sway.   */
const FRAMES = [
  { arms: armsNeutral, legs: legsNeutral, bob: 0,  lean: 0 },
  { arms: armsSwingL,  legs: legsStepL,   bob: -1, lean: -1 },
  { arms: armsNeutral, legs: legsNeutral, bob: 0,  lean: 0 },
  { arms: armsSwingR,  legs: legsStepR,   bob: -1, lean: 1 },
];

/* Draw the upper body (head + coat). Accepts a bob/lean offset so the torso
   grooves while the feet stay planted.                                     */
function drawUpper(dx, dy) {
  const ax = OX + dx, ay = OY + dy;

  // hair / quiff
  px(ax + 2, ay + 0, 7, 2, C.hair);
  px(ax + 2, ay + 2, 2, 4, C.hair);
  px(ax + 8, ay - 1, 2, 2, C.hair);       // quiff peak up-right
  px(ax + 9, ay + 1, 2, 1, C.hairD);

  // face
  px(ax + 4, ay + 2, 5, 6, C.skin);
  px(ax + 4, ay + 2, 5, 1, C.hair);       // hairline over forehead
  px(ax + 7, ay + 4, 1, 1, C.eye);        // eye
  px(ax + 4, ay + 7, 5, 1, C.skinD);      // jaw shadow
  px(ax + 5, ay + 8, 3, 1, C.skin);       // neck

  // coat
  px(ax + 2, ay + 9, 10, 8, C.coat);
  px(ax + 2, ay + 9, 2, 8, C.coatD);      // left shading
  px(ax + 2, ay + 16, 10, 2, C.coat);     // hem
  px(ax + 5, ay + 9, 3, 1, C.collar);     // collar V
  px(ax + 6, ay + 10, 1, 2, C.collar);    // shirt line
}

function drawRects(list, dx, dy) {
  for (const [x, y, w, h, col] of list) px(x + dx, y + dy, w, h, col);
}

/* ---- floating musical notes -------------------------------------------- */
const notes = [];
function spawnNote() {
  notes.push({
    x: CENTER + (Math.random() * 8 - 4),
    y: OY + 2,
    vy: 0.15 + Math.random() * 0.1,
    drift: (Math.random() - 0.5) * 0.12,
    life: 0,
    max: 70 + Math.random() * 30,
    glyph: Math.random() > 0.5 ? "\u266A" : "\u266B",
  });
}
function drawNotes() {
  for (const n of notes) {
    const alpha = Math.max(0, 1 - n.life / n.max);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = C.note;
    ctx.font = `${UNIT * 3}px "Press Start 2P", monospace`;
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
  ctx.arc(canvas.width * 0.5, canvas.height * 0.34, 46, 0, Math.PI * 2);
  ctx.fill();

  // brick wall band
  const wallTop = 26;
  px(0, wallTop, COLS, 8, "#a8523f");
  ctx.fillStyle = "rgba(0,0,0,0.14)";
  for (let r = 0; r < 8; r++) {
    const off = r % 2 ? UNIT * 2 : 0;
    for (let bx = -2; bx < COLS + 2; bx += 4) {
      ctx.fillRect((bx * UNIT) + off, (wallTop + r) * UNIT, UNIT * 0.4, UNIT);
    }
    ctx.fillRect(0, (wallTop + r) * UNIT + UNIT - 1, canvas.width, 1);
  }

  // checkered dance floor
  const floorTop = 34;
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

function loop(t) {
  drawBackground(t);

  // advance dance frame
  if (!reduced && t - lastStep > FRAME_MS) {
    frameIndex = (frameIndex + 1) % FRAMES.length;
    lastStep = t;
  }
  const f = reduced ? FRAMES[0] : FRAMES[frameIndex];

  // feet stay planted; torso + arms get the bob/lean
  drawRects(f.legs, 0, 0);

  if (pointing > 0 && !reduced) {
    drawUpper(0, -1);
    drawRects(armsPoint, 0, -1);
    pointing -= 1;
    if (pointing === 0) statusEl.textContent = "\u266A dancing \u266A";
  } else {
    drawUpper(f.lean, f.bob);
    drawRects(f.arms, f.lean, f.bob);
  }

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
  statusEl.textContent = "\u266A never gonna \u2191 \u266A";
  for (let i = 0; i < 4; i++) spawnNote();
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); triggerPoint(); }
});
canvas.addEventListener("pointerdown", triggerPoint);

requestAnimationFrame(loop);
