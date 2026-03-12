import { REDEEM_CODES, SPECIAL_SECTIONS, STORAGE_KEY, YEAR_CHAPTERS } from './data.js';

const app = document.getElementById('app');
const ACCESS_CODE = 'BYPASS';
const SECRET_WORD = 'STARLIGHT';

const sections = [...YEAR_CHAPTERS, ...SPECIAL_SECTIONS];
const sectionById = new Map(sections.map((item) => [item.id, item]));

const NODE_LAYOUT = {
  'year-2026': { x: -180, y: 120, z: 130, size: 'large', orbit: 23 },
  'year-2027': { x: -230, y: -30, z: -70, size: 'medium', orbit: 25 },
  'year-2028': { x: -20, y: -190, z: 150, size: 'small', orbit: 27 },
  'year-2029': { x: 220, y: -50, z: -120, size: 'medium', orbit: 26 },
  'year-2030': { x: 210, y: 115, z: 120, size: 'large', orbit: 24 },
  gallery: { x: 15, y: 220, z: -150, size: 'large', orbit: 20 },
  'bad-day-letter': { x: -300, y: 40, z: -20, size: 'medium', orbit: 22 },
  playlist: { x: 300, y: 55, z: 30, size: 'medium', orbit: 21 },
  'when-you-miss-me': { x: -300, y: -115, z: 170, size: 'small', orbit: 28 },
  'inside-jokes': { x: 300, y: -120, z: 170, size: 'small', orbit: 29 },
  'sheep-unicorn-origin': { x: 25, y: 285, z: 170, size: 'small', orbit: 30 }
};
const CORE_POINT = { x: 0, y: 0, z: 0 };

const state = {
  view: 'gate',
  selectedId: null,
  status: '',
  unlockedFlash: new Set(),
  secretMessage: false,
  starMessage: false
};

let unlockedSpecials = loadStoredUnlocks();
let gateKeyBuffer = '';
let gateKeyHandler = null;
let secretTypeBuffer = '';
let flashTimer = null;
let motionFrame = null;
let focusTimer = null;
const motionState = {
  rotationY: 0,
  hoveringNode: false,
  paused: false
};

function loadStoredUnlocks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => sectionById.has(id)));
  } catch {
    return new Set();
  }
}

function saveUnlocks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(unlockedSpecials).sort()));
}

function particlesMarkup(count = 48) {
  const particles = [];
  for (let i = 0; i < count; i += 1) {
    const x = Math.round(Math.random() * 1000) / 10;
    const y = Math.round(Math.random() * 1000) / 10;
    const size = (Math.random() * 2.2 + 0.8).toFixed(2);
    const delay = `-${(Math.random() * 10).toFixed(2)}s`;
    const duration = `${(Math.random() * 12 + 16).toFixed(2)}s`;
    const driftX = `${(Math.random() * 60 - 30).toFixed(1)}px`;

    particles.push(
      `<span class="particle" style="--x:${x}%;--y:${y}%;--size:${size}px;--delay:${delay};--duration:${duration};--drift-x:${driftX};"></span>`
    );
  }
  return particles.join('');
}

function isYearUnlocked(item, now = new Date()) {
  if (item.type !== 'year') return false;
  const unlockDate = new Date(item.year, 2, 9, 0, 0, 0, 0);
  return now >= unlockDate;
}

function isUnlocked(item) {
  if (item.type === 'year') return isYearUnlocked(item);
  if (item.defaultUnlocked) return true;
  return unlockedSpecials.has(item.id);
}

function lockLabel(item) {
  if (isUnlocked(item)) return 'Unlocked';
  return item.unlockLabel || 'Locked';
}

function yearTimelineMarkup() {
  return `
    <section class="timeline" aria-label="Year timeline">
      ${YEAR_CHAPTERS.map((chapter) => {
        const unlocked = isUnlocked(chapter);
        return `
          <button class="timeline-dot ${unlocked ? 'is-unlocked' : ''}" type="button" data-open-id="${unlocked ? chapter.id : ''}" ${unlocked ? '' : 'disabled'}>
            <span>${chapter.year}</span>
            <i aria-hidden="true"></i>
          </button>
        `;
      }).join('')}
    </section>
  `;
}

function gateMarkup() {
  return `
    <section class="bypass-gate" aria-label="Entry gate">
      <div class="void-glow" aria-hidden="true"></div>
      <div class="gate-particles" aria-hidden="true">${particlesMarkup(54)}</div>
      <p class="gate-copy">nothing to see here.</p>
      <footer class="completion-progress" aria-label="Website completion progress">
        <div class="completion-progress__meta">
          <span>completion</span>
          <span>55%</span>
        </div>
        <div class="completion-progress__track">
          <span class="completion-progress__fill" style="width: 55%;"></span>
        </div>
      </footer>
    </section>
  `;
}

function entranceMarkup() {
  return `
    <section class="entrance is-staged" id="entrance-stage">
      <div class="void-glow" aria-hidden="true"></div>
      <div class="gate-particles" aria-hidden="true">${particlesMarkup(44)}</div>
      <div class="entrance-inner">
        <h1>A place that grows with time.</h1>
        <p class="lead">Some things aren't meant to appear all at once.</p>
        <button class="primary-btn" type="button" id="enter-vault">Enter</button>
      </div>
    </section>
  `;
}

function nodeMarkup(item) {
  const unlocked = isUnlocked(item);
  const flash = state.unlockedFlash.has(item.id);
  const layout = NODE_LAYOUT[item.key] || { x: 0, y: 0, z: 0, size: 'medium', orbit: 24 };
  const depthBySize = { small: 0.9, medium: 1, large: 1.12 };
  const nodeScale = depthBySize[layout.size] ?? 1;

  return `
    <button
      class="memory-node ${unlocked ? 'is-unlocked' : 'is-locked'} ${flash ? 'is-unlock-flash' : ''} ${`size-${layout.size}`}" 
      type="button"
      data-node-id="${item.id}"
      data-open-id="${unlocked ? item.id : ''}"
      style="--orbit:${layout.orbit}s;--node-scale:${nodeScale};"
      ${unlocked ? '' : 'aria-disabled="true"'}
    >
      <span class="node-dot" aria-hidden="true"></span>
      <span class="node-label">${item.title}</span>
      <span class="node-sub ${unlocked ? '' : 'is-blurred'}">${lockLabel(item)}</span>
      ${flash ? '<span class="node-burst" aria-hidden="true"></span>' : ''}
    </button>
  `;
}

function constellationLinesMarkup(items) {
  const lines = items.map((item) => {
    const unlocked = isUnlocked(item);
    return `<line class="constellation-line ${unlocked ? 'is-unlocked' : ''}" data-link-id="${item.id}" x1="50" y1="50" x2="50" y2="50" />`;
  });

  return `
    <svg class="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      ${lines.join('')}
    </svg>
  `;
}

function vaultMarkup() {
  return `
    <section class="vault-view shell">
      <div class="void-glow" aria-hidden="true"></div>
      <div class="gate-particles is-soft" aria-hidden="true">${particlesMarkup(36)}</div>

      <header class="hero">
        <p class="eyebrow">Private Timeline</p>
        <h1>A place that grows with time.</h1>
        <p class="subtle">A floating memory constellation that expands each March 9 and through hidden codes.</p>
        ${yearTimelineMarkup()}
      </header>

      <section class="constellation-stage" id="constellation-stage" aria-label="Memory constellation">
        <div class="depth-layer back" aria-hidden="true">${particlesMarkup(18)}</div>
        <div class="depth-layer mid" aria-hidden="true">${particlesMarkup(12)}</div>
        <div class="constellation-camera" id="constellation-camera">
          <div class="constellation-group" id="constellation-group">
            <div class="memory-core" id="memory-core" aria-hidden="true">
              <span class="core-ring"></span>
              <span class="core-ring second"></span>
              <span class="core-shell"></span>
              <span class="core-heart"></span>
              <span class="core-specular"></span>
            </div>
            ${constellationLinesMarkup(sections)}
            <div class="memory-nodes">
              ${sections.map((item) => nodeMarkup(item)).join('')}
            </div>
          </div>
        </div>
        <div class="depth-layer front" aria-hidden="true">${particlesMarkup(10)}</div>
      </section>

      <section class="redeem">
        <h2>Unlock with code</h2>
        <form id="redeem-form" autocomplete="off">
          <input id="redeem-code" name="code" maxlength="64" placeholder="enter code" aria-label="Enter unlock code" />
          <button class="primary-btn" type="submit">Unlock</button>
        </form>
        <p class="status" role="status">${state.status}</p>
      </section>

      <button class="hidden-star" type="button" id="hidden-star" aria-label="Hidden star">✦</button>
      ${state.starMessage ? '<p class="secret-toast">You found a tiny star that remembers everything.</p>' : ''}
      ${state.secretMessage ? '<p class="secret-toast">Secret phrase accepted. A quiet page listens.</p>' : ''}

      <footer class="site-footer">Updated every March 9.</footer>
    </section>
  `;
}

function detailMarkup(item) {
  const art = item.art ? `<img class="detail-art" src="${item.art}" alt="Memory image for ${item.title}" />` : '';
  const content = Array.isArray(item.content) ? item.content : [];

  return `
    <section class="chapter-stage shell">
      <div class="chapter-dim" aria-hidden="true"></div>
      <button class="ghost-btn" id="back-to-vault" type="button">Back to vault</button>
      <article class="detail-card">
        <p class="eyebrow">${item.type === 'year' ? `Chapter ${item.year}` : 'Special Unlock'}</p>
        <h1>${item.title}</h1>
        <p class="subtle">${item.summary}</p>
        ${art}
        <div class="detail-copy">
          ${content
            .map((line, index) => `<p class="reveal-line" style="--line-delay:${(index * 0.12).toFixed(2)}s;">${line}</p>`)
            .join('')}
        </div>
      </article>
      <footer class="site-footer">Updated every March 9.</footer>
    </section>
  `;
}

function cleanupGateListener() {
  if (!gateKeyHandler) return;
  window.removeEventListener('keydown', gateKeyHandler);
  gateKeyHandler = null;
}

function bindGateListener() {
  gateKeyBuffer = '';
  cleanupGateListener();

  gateKeyHandler = (event) => {
    if (event.key === 'Enter') {
      if (gateKeyBuffer === ACCESS_CODE) {
        state.view = 'entrance';
        render();
      }
      gateKeyBuffer = '';
      return;
    }

    if (event.key === 'Backspace') {
      gateKeyBuffer = gateKeyBuffer.slice(0, -1);
      return;
    }

    if (event.key.length === 1) {
      gateKeyBuffer = `${gateKeyBuffer}${event.key.toUpperCase()}`.slice(-ACCESS_CODE.length);
    }
  };

  window.addEventListener('keydown', gateKeyHandler);
}

function applyViewClass() {
  document.body.classList.remove('view-gate', 'view-entrance', 'view-vault', 'view-detail');
  document.body.classList.add(`view-${state.view}`);
}

function bindGlobalSecretListener() {
  window.addEventListener('keydown', (event) => {
    if (state.view === 'gate') return;
    if (event.key.length !== 1) return;
    secretTypeBuffer = `${secretTypeBuffer}${event.key.toUpperCase()}`.slice(-SECRET_WORD.length);

    if (secretTypeBuffer === SECRET_WORD) {
      state.secretMessage = true;
      if (state.view === 'vault') render();
    }
  });
}

function openSection(id) {
  if (!id) return;
  const section = sectionById.get(id);
  if (!section || !isUnlocked(section)) return;
  state.selectedId = id;
  state.view = 'detail';
  state.status = '';
  render();
}

function triggerUnlockFlash(ids) {
  if (flashTimer) {
    clearTimeout(flashTimer);
    flashTimer = null;
  }

  state.unlockedFlash = new Set(ids);
  render();

  flashTimer = setTimeout(() => {
    state.unlockedFlash = new Set();
    if (state.view === 'vault') render();
  }, 1100);
}

function bindConstellationMotion() {
  const stage = document.getElementById('constellation-stage');
  const camera = document.getElementById('constellation-camera');
  const group = document.getElementById('constellation-group');
  if (!stage || !camera || !group) return;

  motionState.paused = false;
  motionState.hoveringNode = false;

  camera.style.setProperty('--cam-x', '0px');
  camera.style.setProperty('--cam-y', '0px');
  camera.style.setProperty('--cam-rx', '0deg');
  camera.style.setProperty('--cam-ry', '0deg');
  camera.style.setProperty('--cam-zoom', '1');
  camera.style.setProperty('--cam-breathe', '0px');
  group.style.setProperty('--group-rx', '0deg');
  group.style.setProperty('--group-ry', '0rad');

  const nodeEntries = sections
    .map((item) => {
      const el = stage.querySelector(`.memory-node[data-node-id="${item.id}"]`);
      const link = stage.querySelector(`.constellation-line[data-link-id="${item.id}"]`);
      const pos = NODE_LAYOUT[item.key];
      if (!el || !link || !pos) return null;
      return { item, el, link, pos };
    })
    .filter(Boolean);

  const project = (point, width, height, cameraDistance) => {
    const zDepth = point.z + cameraDistance;
    const perspective = cameraDistance / Math.max(120, zDepth);
    return {
      x: point.x * perspective + width / 2,
      y: point.y * perspective + height / 2,
      scale: perspective
    };
  };

  const orbitState = {
    dragging: false,
    lastX: 0,
    lastY: 0,
    userYaw: 0,
    userPitch: 0,
    cursorYaw: 0,
    cursorPitch: 0
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  stage.addEventListener('pointerdown', (event) => {
    orbitState.dragging = true;
    orbitState.lastX = event.clientX;
    orbitState.lastY = event.clientY;
    stage.classList.add('is-dragging');
    stage.setPointerCapture?.(event.pointerId);
  });

  stage.addEventListener('pointermove', (event) => {
    const rect = stage.getBoundingClientRect();
    const nx = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const ny = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    orbitState.cursorYaw = (nx - 0.5) * 0.22;
    orbitState.cursorPitch = (0.5 - ny) * 0.12;

    if (!orbitState.dragging) return;
    const dx = event.clientX - orbitState.lastX;
    const dy = event.clientY - orbitState.lastY;
    orbitState.lastX = event.clientX;
    orbitState.lastY = event.clientY;
    orbitState.userYaw = clamp(orbitState.userYaw + dx * 0.0055, -1.2, 1.2);
    orbitState.userPitch = clamp(orbitState.userPitch - dy * 0.0038, -0.38, 0.38);
  });

  const stopDrag = () => {
    orbitState.dragging = false;
    stage.classList.remove('is-dragging');
  };

  stage.addEventListener('pointerup', stopDrag);
  stage.addEventListener('pointercancel', stopDrag);

  let lastTime = 0;
  const loop = (time) => {
    if (!lastTime) {
      lastTime = time;
    }

    const delta = (time - lastTime) / 1000;
    lastTime = time;

    const fullTurnSeconds = 84;
    const baseSpeed = (Math.PI * 2) / fullTurnSeconds;
    const speedMultiplier = motionState.hoveringNode ? 0.33 : 1;
    const organic = Math.sin(time * 0.00021) * 0.00018;

    if (!motionState.paused) {
      motionState.rotationY += baseSpeed * speedMultiplier * delta + organic;
    }

    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const camDist = Math.max(640, width * 1.2);
    const totalYaw = motionState.rotationY + orbitState.userYaw + orbitState.cursorYaw;
    const cosY = Math.cos(totalYaw);
    const sinY = Math.sin(totalYaw);
    const tiltX = clamp(0.12 + orbitState.userPitch + orbitState.cursorPitch, -0.5, 0.5);
    const cosX = Math.cos(tiltX);
    const sinX = Math.sin(tiltX);

    const rotatePoint = (point) => {
      const x1 = point.x * cosY - point.z * sinY;
      const z1 = point.x * sinY + point.z * cosY;
      const y2 = point.y * cosX - z1 * sinX;
      const z2 = point.y * sinX + z1 * cosX;
      return { x: x1, y: y2, z: z2 };
    };

    const coreProjected = project(rotatePoint(CORE_POINT), width, height, camDist);

    nodeEntries.forEach((entry, index) => {
      const bob = Math.sin(time * 0.00038 + index * 0.75) * 8;
      const point = rotatePoint({ x: entry.pos.x, y: entry.pos.y + bob, z: entry.pos.z });
      const projected = project(point, width, height, camDist);
      const baseScale = parseFloat(entry.el.style.getPropertyValue('--node-scale') || '1');
      const totalScale = Math.max(0.62, Math.min(1.5, baseScale * projected.scale));

      entry.el.style.transform = `translate3d(${projected.x.toFixed(2)}px, ${projected.y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${totalScale.toFixed(3)})`;
      entry.el.style.zIndex = `${Math.round(1000 + point.z)}`;

      entry.link.setAttribute('x1', ((coreProjected.x / width) * 100).toFixed(3));
      entry.link.setAttribute('y1', ((coreProjected.y / height) * 100).toFixed(3));
      entry.link.setAttribute('x2', ((projected.x / width) * 100).toFixed(3));
      entry.link.setAttribute('y2', ((projected.y / height) * 100).toFixed(3));
      entry.link.style.opacity = `${Math.max(0.15, Math.min(0.8, 0.36 + point.z / 1000))}`;
    });

    const breathe = Math.sin(time * 0.0007) * 5;
    const driftX = Math.sin(time * 0.00028) * 1.8;
    const driftY = Math.cos(time * 0.00024) * 1.4;
    camera.style.setProperty('--cam-breathe', `${breathe.toFixed(2)}px`);
    camera.style.setProperty('--cam-x', `${driftX.toFixed(2)}px`);
    camera.style.setProperty('--cam-y', `${driftY.toFixed(2)}px`);

    motionFrame = window.requestAnimationFrame(loop);
  };

  motionFrame = window.requestAnimationFrame(loop);

  stage.addEventListener('mouseleave', () => {
    motionState.hoveringNode = false;
    camera.classList.remove('is-focused');
    camera.style.setProperty('--cam-zoom', '1');
    orbitState.cursorYaw = 0;
    orbitState.cursorPitch = 0;
    stopDrag();
  });

  app.querySelectorAll('.memory-node').forEach((node) => {
    node.addEventListener('mouseenter', () => {
      motionState.hoveringNode = true;
      camera.classList.add('is-focused');
    });

    node.addEventListener('mouseleave', () => {
      motionState.hoveringNode = false;
      camera.classList.remove('is-focused');
    });
  });
}

function stopConstellationMotion() {
  if (motionFrame) {
    window.cancelAnimationFrame(motionFrame);
    motionFrame = null;
  }

  if (focusTimer) {
    window.clearTimeout(focusTimer);
    focusTimer = null;
  }
}

function bindVaultEvents() {
  app.querySelectorAll('[data-open-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-open-id');
      if (!id) {
        const nodeId = button.getAttribute('data-node-id');
        const item = nodeId ? sectionById.get(nodeId) : null;
        state.status = item ? lockLabel(item) : 'Locked for now.';
        render();
        return;
      }

      if (button.classList.contains('memory-node')) {
        const nodeId = button.getAttribute('data-node-id');
        const item = nodeId ? sectionById.get(nodeId) : null;
        const layout = item ? NODE_LAYOUT[item.key] : null;
        const stage = document.getElementById('constellation-stage');
        const camera = document.getElementById('constellation-camera');

        motionState.paused = true;
        stage?.classList.add('is-focusing');
        camera?.style.setProperty('--cam-zoom', '1.11');

        if (layout && camera) {
          const focusX = -layout.x * 0.14;
          const focusY = -layout.y * 0.1;
          camera.style.setProperty('--cam-x', `${focusX.toFixed(2)}px`);
          camera.style.setProperty('--cam-y', `${focusY.toFixed(2)}px`);
        }

        focusTimer = window.setTimeout(() => {
          openSection(id);
        }, 460);
        return;
      }

      openSection(id);
    });
  });

  const form = document.getElementById('redeem-form');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const input = document.getElementById('redeem-code');
    const code = String(input?.value || '').trim().toUpperCase();

    if (!code) {
      state.status = 'Enter a code first.';
      render();
      return;
    }

    const targets = REDEEM_CODES[code];
    if (!targets) {
      state.status = 'Code not recognized.';
      render();
      return;
    }

    const newUnlocks = [];
    targets.forEach((id) => {
      if (!sectionById.has(id)) return;
      if (!unlockedSpecials.has(id)) {
        unlockedSpecials.add(id);
        newUnlocks.push(id);
      }
    });

    saveUnlocks();
    state.status = newUnlocks.length ? 'New node unlocked.' : 'That code was already used.';

    if (newUnlocks.length) {
      triggerUnlockFlash(newUnlocks);
      return;
    }

    render();
  });

  document.getElementById('hidden-star')?.addEventListener('click', () => {
    state.starMessage = !state.starMessage;
    render();
  });

  bindConstellationMotion();
}

function bindEntranceEvents() {
  const stage = document.getElementById('entrance-stage');
  requestAnimationFrame(() => {
    stage?.classList.add('is-ready');
  });

  document.getElementById('enter-vault')?.addEventListener('click', () => {
    state.view = 'vault';
    render();
  });
}

function render() {
  applyViewClass();

  if (state.view === 'gate') {
    stopConstellationMotion();
    app.innerHTML = gateMarkup();
    bindGateListener();
    return;
  }

  cleanupGateListener();

  if (state.view === 'entrance') {
    stopConstellationMotion();
    app.innerHTML = entranceMarkup();
    bindEntranceEvents();
    return;
  }

  if (state.view === 'detail' && state.selectedId) {
    stopConstellationMotion();
    const section = sectionById.get(state.selectedId);
    if (!section || !isUnlocked(section)) {
      state.view = 'vault';
      state.selectedId = null;
      render();
      return;
    }

    app.innerHTML = detailMarkup(section);
    document.getElementById('back-to-vault')?.addEventListener('click', () => {
      state.view = 'vault';
      state.selectedId = null;
      render();
    });
    return;
  }

  state.view = 'vault';
  stopConstellationMotion();
  applyViewClass();
  app.innerHTML = vaultMarkup();
  bindVaultEvents();
}

window.addEventListener('mousemove', (event) => {
  const x = (event.clientX / window.innerWidth) * 100;
  const y = (event.clientY / window.innerHeight) * 100;
  document.body.style.setProperty('--mx', `${x.toFixed(2)}%`);
  document.body.style.setProperty('--my', `${y.toFixed(2)}%`);
});

bindGlobalSecretListener();
render();
