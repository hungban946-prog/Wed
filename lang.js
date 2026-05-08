const app = document.querySelector(".app");
const openFileButton = document.querySelector("[data-open-file]");
const startButton = document.querySelector("[data-start]");
const restartButton = document.querySelector("[data-restart]");
const screenMap = new Map(
  [...document.querySelectorAll("[data-screen]")].map((element) => [element.dataset.screen, element])
);
const spaceScreen = screenMap.get("space");
const orbitLayer = document.getElementById("orbitLayer");
const starfield = document.getElementById("starfield");
const ctx = starfield.getContext("2d");
const params = new URLSearchParams(window.location.search);
const autoStart = params.get("autostart");

const quotePool = [
  "NGỐC",
  "HỐN",
  "TRE CON",
  "KHÓC LÓC",
  "GHÉT",
  "XẤU SÍ",
  "CHÁN",
  "TÚC",
  "LợN NGỐC",
  "LợN GÀ"
];

const microPool = [
  ":)))",
  "Mi todo",
  "Por siempre",
  "Solo tu",
  "Es mi vida",
  "Mi destino",
  "Mi estrella",
  "Te amo",
  "Te adoro",
  "Mi universo"
];

const stickerPool = ["🧸", "💌", "💕", "🐻"];
const photoPool = [
  { theme: "sunset", duo: "🙋" },
  { theme: "night", duo: "👫" },
  { theme: "pink", duo: "💞" }
];

const state = {
  running: false,
  width: 0,
  height: 0,
  centerX: 0,
  centerY: 0,
  shipX: 0,
  shipY: 0,
  shipVX: 0,
  shipVY: 0,
  pointerTargetX: 0,
  pointerTargetY: 0,
  pointerX: 0,
  pointerY: 0,
  cameraX: 0,
  cameraY: 0,
  bank: 0,
  warp: 1,
  boost: 0,
  boostTarget: 0,
  stars: [],
  actors: [],
  lastTime: performance.now()
};

const TOTAL_STARS = 420;
const TOTAL_ACTORS = 92;
const MAX_DEPTH = 3200;
const MIN_DEPTH = 100;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function damp(current, target, lambda, delta) {
  return current + (target - current) * (1 - Math.exp(-lambda * delta));
}

function setScreen(name) {
  app.dataset.screen = name;
  screenMap.forEach((element, key) => {
    element.classList.toggle("is-active", key === name);
  });
}

function resizeScene() {
  const bounds = spaceScreen.getBoundingClientRect();
  state.width = Math.max(1, Math.floor(bounds.width));
  state.height = Math.max(1, Math.floor(bounds.height));
  state.centerX = state.width / 2;
  state.centerY = state.height * 0.55;

  const ratio = window.devicePixelRatio || 1;
  starfield.width = Math.floor(state.width * ratio);
  starfield.height = Math.floor(state.height * ratio);
  starfield.style.width = `${state.width}px`;
  starfield.style.height = `${state.height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function createStar() {
  return {
    x: state.shipX + randomBetween(-state.width * 1.3, state.width * 1.3),
    y: state.shipY + randomBetween(-state.height * 1.3, state.height * 1.3),
    z: randomBetween(160, MAX_DEPTH)
  };
}

function resetStar(star) {
  star.x = state.shipX + randomBetween(-state.width * 1.35, state.width * 1.35);
  star.y = state.shipY + randomBetween(-state.height * 1.35, state.height * 1.35);
  star.z = randomBetween(180, MAX_DEPTH);
}

function seedStars() {
  state.stars = Array.from({ length: TOTAL_STARS }, createStar);
}

function actorType() {
  const roll = Math.random();
  if (roll < 0.32) return "micro";
  if (roll < 0.58) return "quote";
  if (roll < 0.76) return "heart";
  if (roll < 0.9) return "sticker";
  return "photo";
}

function createActorElement(type, payload) {
  const element = document.createElement(type === "photo" ? "article" : "span");
  element.className = `floating-item floating-item--${type}`;

  if (type === "quote" || type === "micro") {
    element.textContent = payload;
  } else if (type === "heart") {
    element.textContent = "♥";
  } else if (type === "sticker") {
    element.textContent = payload;
  } else {
    element.innerHTML = `
      <div class="memory-card memory-card--${payload.theme}">
        <div class="memory-card__art">
          <div class="memory-card__duo">${payload.duo}</div>
        </div>
      </div>
    `;
  }

  orbitLayer.appendChild(element);
  return element;
}

function resetActor(actor, initial = false) {
  const centerBias = actor.type === "photo" || actor.type === "sticker" ? 0.45 : 0.62;
  const spread = Math.random() < 0.58 ? centerBias : 1;
  actor.x = state.shipX + randomBetween(-state.width * 0.88 * spread, state.width * 0.88 * spread);
  actor.y = state.shipY + randomBetween(-state.height * 0.88 * spread, state.height * 0.88 * spread);
  actor.z = initial ? randomBetween(MIN_DEPTH, MAX_DEPTH) : randomBetween(MAX_DEPTH * 0.76, MAX_DEPTH * 1.08);
  actor.rotation = randomBetween(-22, 22);
  actor.spin = randomBetween(-10, 10);
  actor.baseScale = actor.type === "photo" ? randomBetween(0.66, 0.96) : randomBetween(0.84, 1.28);
  actor.speed = actor.type === "photo" ? randomBetween(270, 370) : randomBetween(290, 420);
  actor.wobble = randomBetween(-18, 18);
  actor.wobbleSpeed = randomBetween(0.0006, 0.0014);
}

function seedActors() {
  orbitLayer.innerHTML = "";
  state.actors = [];

  for (let index = 0; index < TOTAL_ACTORS; index += 1) {
    const type = actorType();
    let payload = null;

    if (type === "quote") payload = quotePool[index % quotePool.length];
    if (type === "micro") payload = microPool[index % microPool.length];
    if (type === "sticker") payload = stickerPool[index % stickerPool.length];
    if (type === "photo") payload = photoPool[index % photoPool.length];

    const actor = { type, payload, element: createActorElement(type, payload) };
    resetActor(actor, true);
    state.actors.push(actor);
  }
}

function updateFlight(delta) {
  const steerX = state.pointerTargetX;
  const steerY = state.pointerTargetY;
  const maxShipVX = state.width * 0.16;
  const maxShipVY = state.height * 0.13;

  state.pointerX = damp(state.pointerX, steerX, 7.5, delta);
  state.pointerY = damp(state.pointerY, steerY, 7.5, delta);
  state.shipVX = damp(state.shipVX, state.pointerX * maxShipVX, 5.2, delta);
  state.shipVY = damp(state.shipVY, state.pointerY * maxShipVY, 5.2, delta);
  state.shipX += state.shipVX * delta;
  state.shipY += state.shipVY * delta;

  state.boost = damp(state.boost, state.boostTarget, 6.8, delta);
  state.cameraX = damp(state.cameraX, state.shipVX * 0.18, 4.8, delta);
  state.cameraY = damp(state.cameraY, state.shipVY * 0.18, 4.8, delta);
  state.bank = damp(state.bank, state.pointerX * -7 + state.pointerY * 2.2, 5.5, delta);
  state.warp = damp(
    state.warp,
    1 + Math.hypot(state.pointerX, state.pointerY) * 0.1 + state.boost * 0.5,
    4.4,
    delta
  );

  orbitLayer.style.transform = `rotateZ(${state.bank.toFixed(2)}deg) scale(${(1.015 + (state.warp - 1) * 0.08).toFixed(3)})`;
  starfield.style.transform = `rotateZ(${(state.bank * 0.32).toFixed(2)}deg) scale(${(1 + (state.warp - 1) * 0.06).toFixed(3)})`;
}

function drawStars(delta) {
  ctx.clearRect(0, 0, state.width, state.height);
  const speed = 760 * state.warp * (1 + state.boost * 1.35);

  for (const star of state.stars) {
    star.z -= speed * delta;

    if (star.z <= 1) {
      resetStar(star);
      continue;
    }

    const nearScale = 1480 / star.z;
    const farScale = 1480 / (star.z + 170);
    const turnFactor = 0.18 + (star.z / MAX_DEPTH) * 0.72;
    const worldX = star.x - state.shipX - state.cameraX * turnFactor;
    const worldY = star.y - state.shipY - state.cameraY * turnFactor;
    const x1 = state.centerX + worldX * farScale;
    const y1 = state.centerY + worldY * farScale;
    const x2 = state.centerX + worldX * nearScale;
    const y2 = state.centerY + worldY * nearScale;
    const intensity = clamp((MAX_DEPTH - star.z) / MAX_DEPTH, 0.12, 1);

    ctx.shadowBlur = intensity * 10;
    ctx.shadowColor = `rgba(255, 168, 228, ${intensity})`;
    ctx.strokeStyle = `rgba(255, 198, 240, ${intensity})`;
    ctx.lineWidth = 0.45 + intensity * 1.8;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function drawActors(delta, elapsed) {
  for (const actor of state.actors) {
    actor.z -= actor.speed * state.warp * (1 + state.boost * 0.95) * delta;

    if (actor.z <= MIN_DEPTH) {
      resetActor(actor);
    }

    const scale = clamp(1360 / actor.z, 0.14, 5.2) * actor.baseScale;
    const turnFactor = 0.26 + (actor.z / MAX_DEPTH) * 0.78;
    const worldX = actor.x - state.shipX - state.cameraX * turnFactor;
    const worldY = actor.y - state.shipY - state.cameraY * turnFactor;
    const driftX = Math.sin(elapsed * actor.wobbleSpeed + actor.wobble) * 8;
    const driftY = Math.cos(elapsed * actor.wobbleSpeed * 0.8 + actor.wobble) * 6;
    const x = state.centerX + worldX * scale + driftX;
    const y = state.centerY + worldY * scale + driftY;
    const opacity = clamp((MAX_DEPTH - actor.z) / (MAX_DEPTH * 0.62), 0.12, 1);
    const rotation = actor.rotation + elapsed * 0.0013 * actor.spin + state.bank * 0.45;

    actor.element.style.opacity = opacity.toFixed(3);
    actor.element.style.transform = `
      translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)
      translate(-50%, -50%)
      scale(${scale})
      rotate(${rotation.toFixed(2)}deg)
    `;

    if (
      x < -state.width * 0.34 ||
      x > state.width * 1.34 ||
      y < -state.height * 0.34 ||
      y > state.height * 1.34
    ) {
      resetActor(actor);
    }
  }
}

function frame(now) {
  const delta = Math.min((now - state.lastTime) / 1000, 0.025);
  state.lastTime = now;

  if (state.running) {
    updateFlight(delta);
    drawStars(delta);
    drawActors(delta, now);
  }

  requestAnimationFrame(frame);
}

function startSpace() {
  state.running = true;
  state.shipX = 0;
  state.shipY = 0;
  state.shipVX = 0;
  state.shipVY = 0;
  state.pointerTargetX = 0;
  state.pointerTargetY = 0;
  state.pointerX = 0;
  state.pointerY = 0;
  state.cameraX = 0;
  state.cameraY = 0;
  state.bank = 0;
  state.warp = 1;
  state.boost = 0;
  state.boostTarget = 0;
  resizeScene();
  seedStars();
  seedActors();
  setScreen("space");
}

function goToFiles() {
  state.running = false;
  state.shipX = 0;
  state.shipY = 0;
  state.shipVX = 0;
  state.shipVY = 0;
  state.pointerTargetX = 0;
  state.pointerTargetY = 0;
  state.pointerX = 0;
  state.pointerY = 0;
  state.cameraX = 0;
  state.cameraY = 0;
  state.bank = 0;
  state.warp = 1;
  state.boost = 0;
  state.boostTarget = 0;
  orbitLayer.style.transform = "";
  starfield.style.transform = "";
  setScreen("files");
}

function handlePointerMove(event) {
  const x = "touches" in event ? event.touches[0]?.clientX ?? state.centerX : event.clientX;
  const y = "touches" in event ? event.touches[0]?.clientY ?? state.centerY : event.clientY;
  const bounds = spaceScreen.getBoundingClientRect();
  const localX = bounds.width ? (x - bounds.left) / bounds.width : 0.5;
  const localY = bounds.height ? (y - bounds.top) / bounds.height : 0.5;
  state.pointerTargetX = clamp((localX - 0.5) * 2, -1, 1);
  state.pointerTargetY = clamp((localY - 0.5) * 2, -1, 1);
}

function handlePointerLeave() {
  state.pointerTargetX = 0;
  state.pointerTargetY = 0;
}

function handleBoostStart(event) {
  if (!state.running) return;
  state.boostTarget = 1;
  if (event) {
    handlePointerMove(event);
  }
}

function handleBoostEnd() {
  state.boostTarget = 0;
}

openFileButton.addEventListener("click", () => {
  state.running = false;
  setScreen("launch");
});
startButton.addEventListener("click", startSpace);
restartButton.addEventListener("click", goToFiles);
window.addEventListener("mousemove", handlePointerMove, { passive: true });
window.addEventListener("touchmove", handlePointerMove, { passive: true });
spaceScreen.addEventListener("mousedown", handleBoostStart);
spaceScreen.addEventListener("touchstart", handleBoostStart, { passive: true });
window.addEventListener("mouseup", handleBoostEnd, { passive: true });
window.addEventListener("touchend", handleBoostEnd, { passive: true });
window.addEventListener("touchcancel", handleBoostEnd, { passive: true });
window.addEventListener("mouseleave", handlePointerLeave, { passive: true });
window.addEventListener("touchend", handlePointerLeave, { passive: true });
window.addEventListener("touchcancel", handlePointerLeave, { passive: true });
window.addEventListener("resize", () => {
  resizeScene();
  if (state.running) {
    seedStars();
    seedActors();
  }
});

document.addEventListener("visibilitychange", () => {
  state.lastTime = performance.now();
});

resizeScene();

if (autoStart === "launch") {
  setScreen("launch");
} else if (autoStart === "space" || autoStart === "1") {
  startSpace();
} else {
  setScreen("files");
}

requestAnimationFrame(frame);
