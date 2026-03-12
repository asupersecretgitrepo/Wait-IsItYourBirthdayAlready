import { REDEEM_CODES, SPECIAL_SECTIONS, STORAGE_KEY, YEAR_CHAPTERS } from './data.js';

const app = document.getElementById('app');
const ACCESS_CODE = 'R0S1E';
const SECRET_WORD = 'STARLIGHT';
const KONAMI_CODE = ['ARROWUP', 'ARROWUP', 'ARROWDOWN', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'ARROWLEFT', 'ARROWRIGHT', 'B', 'A'];
const ORBIT_WORD = 'ORBIT';
const NOVA_WORD = 'NOVA';
const WISH_WORD = 'WISH';
const ROSE_WORD = 'ROSE';
const ACHIEVEMENT_STORAGE_KEY = 'time_capsule_achievements';
const EASTER_MESSAGES = [
  'A quiet comet just crossed the archive.',
  'The constellation noticed you looking back.',
  'Something in the dark rearranged itself for a second.',
  'One of the galaxies is pretending not to blink.',
  'The archive hummed like it knew your name.',
  'A hidden orbit clicked into place for a second.'
];
const ACHIEVEMENTS = [
  { id: 'entry_rosie', label: 'Rosie Entry', hint: 'Enter the gate with the right code.' },
  { id: 'secret_starlight', label: 'Starlight', hint: 'Type a quiet cosmic word.' },
  { id: 'secret_orbit', label: 'Orbit', hint: 'Type the movement word.' },
  { id: 'secret_nova', label: 'Nova', hint: 'Type the explosion word.' },
  { id: 'secret_wish', label: 'Wish', hint: 'Type the hopeful word.' },
  { id: 'secret_rose', label: 'Rose Tint', hint: 'Type the flower word.' },
  { id: 'secret_konami', label: 'Stardust Mode', hint: 'Use a classic cheat code.' },
  { id: 'star_tapper', label: 'Seven Star Taps', hint: 'Tap the hidden star seven times.' },
  { id: 'title_tapper', label: 'Archive Blink', hint: 'Tap the main archive title five times.' },
  { id: 'index_tapper', label: 'Wish Mode', hint: 'Tap the archive index title four times.' },
  { id: 'subtitle_double', label: 'Double Meaning', hint: 'Double-click the hero subtitle.' },
  { id: 'footer_tapper', label: 'March 9', hint: 'Tap the footer three times.' },
  { id: 'shooting_star', label: 'Comet Catcher', hint: 'Catch the shooting star when it appears.' },
  { id: 'empty_space_comet', label: 'Empty Space Comet', hint: 'Double-click empty space in the constellation.' }
];
const HIDDEN_SECTION_IDS = new Set(['special-playlist', 'special-miss-me', 'special-jokes', 'special-origin']);

const sections = [...YEAR_CHAPTERS, ...SPECIAL_SECTIONS].filter((item) => !HIDDEN_SECTION_IDS.has(item.id));
const sectionById = new Map(sections.map((item) => [item.id, item]));

const NODE_LAYOUT = {
  'year-2026': { x: -430, y: -250, z: 240, size: 'large', kind: 'orb' },
  'year-2027': { x: 10, y: -390, z: -260, size: 'large', kind: 'crystal' },
  'year-2028': { x: 460, y: -160, z: 170, size: 'large', kind: 'orb' },
  'year-2029': { x: 350, y: 260, z: -340, size: 'large', kind: 'crystal' },
  'year-2030': { x: -150, y: 380, z: 300, size: 'large', kind: 'orb' },
  'special-gallery': { x: -520, y: 24, z: -290, size: 'medium', kind: 'frame' },
  'special-bad-day': { x: -230, y: 100, z: -430, size: 'medium', kind: 'letter' }
};

const SATELLITE_KIND_SEQUENCE = ['ring', 'shard', 'frame', 'crystal'];

function buildChapterSystem(chapter) {
  const content = Array.isArray(chapter.content) ? chapter.content : [];
  const satellites = [
    {
      id: `${chapter.id}__overview`,
      parentId: chapter.id,
      type: 'satellite',
      title: 'Overview',
      summary: `A closer orbit around ${chapter.title}.`,
      content: [chapter.summary, content[0] || 'This chapter is still collecting the memories that will fill it.'],
      kind: 'ring',
      orbitRadius: 132,
      orbitHeight: 22,
      orbitSpeed: 0.72,
      phase: 0.25
    }
  ];

  if (chapter.art) {
    satellites.push({
      id: `${chapter.id}__photo`,
      parentId: chapter.id,
      type: 'satellite',
      title: 'Saved Snapshot',
      summary: 'A small orbit holding onto a visual memory.',
      content: ['A saved image from this chapter still circles here.', chapter.summary],
      art: chapter.art,
      kind: 'frame',
      orbitRadius: 188,
      orbitHeight: 14,
      orbitSpeed: -0.48,
      phase: 1.8
    });
  }

  content.slice(0, 3).forEach((line, index) => {
    satellites.push({
      id: `${chapter.id}__note-${index + 1}`,
      parentId: chapter.id,
      type: 'satellite',
      title: content.length === 1 ? 'Saved Note' : `Memory ${index + 1}`,
      summary: 'A smaller orbit carrying one saved line.',
      content: [line],
      kind: SATELLITE_KIND_SEQUENCE[index % SATELLITE_KIND_SEQUENCE.length],
      orbitRadius: 110 + index * 34 + (chapter.art ? 14 : 0),
      orbitHeight: index % 2 === 0 ? 18 : -18,
      orbitSpeed: index % 2 === 0 ? 0.9 + index * 0.12 : -(0.78 + index * 0.1),
      phase: 0.9 + index * 1.45
    });
  });

  return satellites;
}

const CHAPTER_SYSTEMS = new Map(YEAR_CHAPTERS.map((chapter) => [chapter.id, buildChapterSystem(chapter)]));
const satelliteById = new Map(Array.from(CHAPTER_SYSTEMS.values()).flat().map((item) => [item.id, item]));

const NETWORK_CONNECTIONS = [
  ['year-2026', 'special-gallery'],
  ['year-2026', 'year-2027'],
  ['year-2026', 'special-bad-day'],
  ['year-2027', 'year-2028'],
  ['year-2028', 'year-2029'],
  ['year-2029', 'year-2030'],
  ['year-2030', 'special-gallery'],
  ['special-gallery', 'special-bad-day']
];

const neighborMap = new Map();
NETWORK_CONNECTIONS.forEach(([from, to]) => {
  if (!neighborMap.has(from)) neighborMap.set(from, new Set());
  if (!neighborMap.has(to)) neighborMap.set(to, new Set());
  neighborMap.get(from).add(to);
  neighborMap.get(to).add(from);
});

const state = {
  view: 'gate',
  selectedId: null,
  systemId: null,
  panel: 'vault',
  status: '',
  unlockedFlash: new Set(),
  secretMessage: false,
  starMessage: false,
  easterToast: '',
  stardustMode: false,
  cometVisible: false,
  roseMode: false,
  wishMode: false,
  novaFlash: false,
  gateLetters: [],
  gateAttempt: 'idle'
};

let unlockedSpecials = loadStoredUnlocks();
let unlockedAchievements = loadStoredAchievements();
let gateKeyBuffer = '';
let gateKeyHandler = null;
let secretTypeBuffer = '';
let orbitTypeBuffer = '';
let novaTypeBuffer = '';
let wishTypeBuffer = '';
let roseTypeBuffer = '';
let konamiBuffer = [];
let flashTimer = null;
let motionFrame = null;
let easterToastTimer = null;
let cometTimer = null;
let novaTimer = null;
let gateAttemptTimer = null;
const motionState = {
  rotationY: 0,
  cursorYaw: 0,
  cursorPitch: 0,
  userYaw: 0,
  userPitch: 0,
  dragging: false,
  dragMoved: false,
  lastX: 0,
  lastY: 0,
  hoveredId: null,
  speedBoostUntil: 0,
  starTapCount: 0,
  heroTapCount: 0,
  indexTapCount: 0,
  footerTapCount: 0,
  sparkTapCount: 0
};

function loadStoredAchievements() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => ACHIEVEMENTS.some((achievement) => achievement.id === id)));
  } catch {
    return new Set();
  }
}

function saveAchievements() {
  localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(Array.from(unlockedAchievements).sort()));
}

function unlockAchievement(id) {
  if (unlockedAchievements.has(id)) return false;
  unlockedAchievements.add(id);
  saveAchievements();
  return true;
}

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

function particlesMarkup(count = 32) {
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

function detailById(id) {
  return sectionById.get(id) || satelliteById.get(id) || null;
}

function isDetailUnlocked(item) {
  if (!item) return false;
  if (item.type === 'satellite') {
    return isUnlocked(sectionById.get(item.parentId));
  }
  return isUnlocked(item);
}

function lockLabel(item) {
  if (isUnlocked(item)) return 'Open';
  return item.unlockLabel || 'Locked';
}

function unlockedCount(items) {
  return items.filter((item) => isUnlocked(item)).length;
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
      <div class="gate-letters ${state.gateAttempt === 'success' ? 'is-success' : state.gateAttempt === 'error' ? 'is-error' : ''}" aria-hidden="true">
        ${state.gateLetters
          .map(
            (item) => `
              <span
                class="gate-letter ${item.state ? `is-${item.state}` : ''}"
                style="left:${item.x}%;top:${item.y}%;--rot:${item.rotation}deg;transform:translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale});animation-delay:${item.delay}s;"
              >${item.char}</span>
            `
          )
          .join('')}
      </div>
      <div class="gate-copy">
        <p>nothing to see here.</p>
      </div>
      <footer class="completion-progress" aria-label="Website completion progress">
        <div class="completion-progress__meta">
          <span>completion</span>
          <span>67%</span>
        </div>
        <div class="completion-progress__track">
          <span class="completion-progress__fill" style="width: 67%;"></span>
        </div>
      </footer>
    </section>
  `;
}

function entranceMarkup() {
  return `
    <section class="entrance is-staged" id="entrance-stage">
      <div class="void-glow" aria-hidden="true"></div>
      <div class="gate-particles" aria-hidden="true">${particlesMarkup(40)}</div>
      <div class="entrance-inner">
        <p class="eyebrow">Private Archive</p>
        <h1>A place that grows with time.</h1>
        <p class="lead">A floating constellation of memories, quietly expanding over time.</p>
        <button class="primary-btn" type="button" id="enter-vault">Enter</button>
      </div>
    </section>
  `;
}

function showEasterToast(message, duration = 2600) {
  if (easterToastTimer) {
    clearTimeout(easterToastTimer);
  }

  state.easterToast = message;
  render();

  easterToastTimer = setTimeout(() => {
    state.easterToast = '';
    if (state.view === 'vault') render();
  }, duration);
}

function pulseNova(duration = 1800) {
  if (novaTimer) {
    clearTimeout(novaTimer);
  }

  state.novaFlash = true;
  render();

  novaTimer = setTimeout(() => {
    state.novaFlash = false;
    if (state.view === 'vault') render();
  }, duration);
}

function achievementsMarkup() {
  return `
    <section class="achievements-index" aria-label="Secret achievements">
      <div class="achievements-index__header">
        <div>
          <p class="eyebrow">Achievements</p>
          <h3>${unlockedAchievements.size} / ${ACHIEVEMENTS.length} found</h3>
        </div>
      </div>
      <div class="achievements-index__list">
        ${ACHIEVEMENTS.map((achievement) => {
          const found = unlockedAchievements.has(achievement.id);
          return `
            <article class="achievement-item ${found ? 'is-found' : 'is-hidden'}">
              <strong>${achievement.label}</strong>
              <small>${found ? 'Found' : achievement.hint}</small>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function achievementsPageMarkup() {
  return `
    <section class="detail-overlay achievements-page" aria-label="Achievements">
      <div class="detail-overlay__backdrop" data-close-achievements="true"></div>
      <article class="detail-overlay__panel achievements-page__panel">
        <button class="ghost-btn detail-overlay__close" type="button" data-close-achievements="true">Back</button>
        <p class="eyebrow">Achievements</p>
        <h2>Secret Progress</h2>
        <p class="subtle">A clearer index of every hidden interaction in the archive.</p>
        ${achievementsMarkup()}
      </article>
    </section>
  `;
}

function connectionMarkup() {
  return `
    <svg class="constellation-lines" id="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      ${NETWORK_CONNECTIONS.map(
        ([from, to]) => `
          <line
            class="constellation-line"
            data-link-from="${from}"
            data-link-to="${to}"
            x1="50"
            y1="50"
            x2="50"
            y2="50"
          />
        `
      ).join('')}
    </svg>
  `;
}

function nodeMarkup(item) {
  const unlocked = isUnlocked(item);
  const flash = state.unlockedFlash.has(item.id);
  const layout = NODE_LAYOUT[item.id];

  return `
    <button
      class="memory-node ${unlocked ? 'is-unlocked' : 'is-locked'} ${flash ? 'is-unlock-flash' : ''} size-${layout.size} kind-${layout.kind} ${state.selectedId === item.id ? 'is-selected' : ''}"
      type="button"
      data-node-id="${item.id}"
      data-open-id="${unlocked ? item.id : ''}"
      ${unlocked ? '' : 'aria-disabled="true"'}
    >
      <span class="memory-node__shape" aria-hidden="true">
        <span class="memory-node__core"></span>
      </span>
      <span class="memory-node__label">
        <strong>${item.title}</strong>
        <small>${lockLabel(item)}</small>
      </span>
    </button>
  `;
}

function systemNodeMarkup(chapterId) {
  const satellites = CHAPTER_SYSTEMS.get(chapterId) || [];
  const chapter = sectionById.get(chapterId);
  const unlocked = isUnlocked(chapter);

  return satellites
    .map(
      (item) => `
        <button
          class="memory-node memory-node--satellite ${unlocked ? 'is-unlocked' : 'is-locked'} size-small kind-${item.kind} ${state.selectedId === item.id ? 'is-selected' : ''}"
          type="button"
          data-satellite-id="${item.id}"
          data-open-id="${unlocked ? item.id : ''}"
          ${unlocked ? '' : 'aria-disabled="true"'}
        >
          <span class="memory-node__shape" aria-hidden="true">
            <span class="memory-node__core"></span>
          </span>
          <span class="memory-node__label">
            <strong>${item.title}</strong>
            <small>${chapter?.title || 'Chapter orbit'}</small>
          </span>
        </button>
      `
    )
    .join('');
}

function chapterSystemPanelMarkup() {
  if (!state.systemId) return '';
  const chapter = sectionById.get(state.systemId);
  const satellites = CHAPTER_SYSTEMS.get(state.systemId) || [];
  if (!chapter) return '';

  return `
    <section class="chapter-system overlay-panel overlay-panel--system" aria-label="Focused chapter system">
      <div class="chapter-system__header">
        <div>
          <p class="eyebrow">Focused System</p>
          <h2>${chapter.title}</h2>
          <p class="subtle">Smaller planets orbit this chapter now. Click a planet to open it, or open the main chapter directly.</p>
        </div>
        <button class="ghost-btn" type="button" data-close-system="true">Back Out</button>
      </div>
      <div class="chapter-system__actions">
        <button class="archive-index__item is-unlocked chapter-system__core-btn" type="button" data-open-detail="${chapter.id}">
          <span class="archive-index__meta">${chapter.year}</span>
          <strong>Open Main Chapter</strong>
          <small>${chapter.summary}</small>
        </button>
      </div>
      <div class="chapter-system__list">
        ${satellites
          .map(
            (item) => `
              <button class="archive-index__item is-unlocked chapter-system__item" type="button" data-open-detail="${item.id}">
                <span class="archive-index__meta">Orbit</span>
                <strong>${item.title}</strong>
                <small>${item.summary}</small>
              </button>
            `
          )
          .join('')}
      </div>
    </section>
  `;
}

function overlayMarkup() {
  if (!state.selectedId) return '';
  const item = detailById(state.selectedId);
  if (!item || !isDetailUnlocked(item)) return '';
  const content = Array.isArray(item.content) ? item.content : [];
  const art = item.art ? `<img class="detail-art" src="${item.art}" alt="Memory image for ${item.title}" />` : '';

  return `
    <aside class="detail-overlay" aria-label="Memory detail">
      <div class="detail-overlay__backdrop" data-close-overlay="true"></div>
      <article class="detail-overlay__panel">
        <button class="ghost-btn detail-overlay__close" type="button" data-close-overlay="true">Close</button>
        <p class="eyebrow">${item.type === 'year' ? `Chapter ${item.year}` : item.type === 'satellite' ? 'Orbiting Memory' : 'Special Unlock'}</p>
        <h2>${item.title}</h2>
        <p class="subtle">${item.summary}</p>
        ${art}
        <div class="detail-copy">
          ${content
            .map((line, index) => `<p class="reveal-line" style="--line-delay:${(index * 0.12).toFixed(2)}s;">${line}</p>`)
            .join('')}
        </div>
      </article>
    </aside>
  `;
}

function vaultMarkup() {
  const totalUnlocked = unlockedCount(sections);
  const nextYear = YEAR_CHAPTERS.find((item) => !isUnlocked(item));

  return `
    <section class="vault-view">
      <div class="void-glow" aria-hidden="true"></div>
      <div class="gate-particles is-soft" aria-hidden="true">${particlesMarkup(28)}</div>

      <section class="constellation-stage" id="constellation-stage" aria-label="Memory constellation">
        <div class="depth-layer back" aria-hidden="true">${particlesMarkup(16)}</div>
        <div class="depth-layer mid" aria-hidden="true">${particlesMarkup(12)}</div>
        <div class="depth-layer stars" aria-hidden="true">${particlesMarkup(9)}</div>
        <div class="constellation-camera" id="constellation-camera">
          <div class="constellation-group" id="constellation-group">
            ${connectionMarkup()}
            <div class="memory-nodes">
              ${sections.map((item) => nodeMarkup(item)).join('')}
              ${state.systemId ? systemNodeMarkup(state.systemId) : ''}
            </div>
          </div>
        </div>
        <div class="depth-layer front" aria-hidden="true">${particlesMarkup(10)}</div>

        <header class="hero constellation-hero overlay-panel overlay-panel--hero">
          <div class="hero-copy">
            <p class="eyebrow">Private Timeline</p>
            <h1 id="archive-title">Constellation archive</h1>
            <p class="subtle" id="archive-subtle">${state.systemId ? 'This chapter is expanded into its own little system. Use the orbiting planets or the right-side panel to navigate it.' : 'Each memory lives as a node in a drifting network. Hover to trace connections. Click a chapter to zoom into its system.'}</p>
            ${yearTimelineMarkup()}
          </div>
          <div class="hero-meta">
            <p><strong>${totalUnlocked}</strong> of ${sections.length} memories unlocked</p>
            <p>${nextYear ? nextYear.unlockLabel : 'Every annual chapter is open.'}</p>
            <button class="ghost-btn hero-meta__action" type="button" id="open-achievements">Open Achievements</button>
          </div>
        </header>

        <section class="archive-index overlay-panel overlay-panel--index" aria-label="Memory index">
          <div class="archive-index__header">
            <div>
              <p class="eyebrow">Archive Index</p>
              <h2 id="archive-index-title">Every node, clearly labeled</h2>
            </div>
            <p class="section-note">Use this list when you want the constellation feel without guessing what each object represents.</p>
          </div>
          <div class="archive-index__grid">
            ${sections
              .map((item) => {
                const unlocked = isUnlocked(item);
                return `
                  <button
                    class="archive-index__item ${unlocked ? 'is-unlocked' : 'is-locked'}"
                    type="button"
                    data-open-id="${unlocked ? item.id : ''}"
                    data-index-id="${item.id}"
                  >
                    <span class="archive-index__meta">${item.type === 'year' ? item.year : 'Special'}</span>
                    <strong>${item.title}</strong>
                    <small>${lockLabel(item)}</small>
                  </button>
                `;
              })
              .join('')}
          </div>
        </section>

        ${chapterSystemPanelMarkup()}

        <section class="redeem overlay-panel overlay-panel--redeem">
          <div class="construction-banner" aria-label="Under construction notice">
            <span>Under Construction</span>
          </div>
          <div>
            <h2>Unlock with code</h2>
            <p class="subtle redeem-copy">This part of the archive is still being assembled. The code input is staying in place while the final unlock experience is built out.</p>
          </div>
          <form id="redeem-form" autocomplete="off">
            <input id="redeem-code" name="code" maxlength="64" placeholder="coming soon" aria-label="Enter unlock code" disabled />
            <button class="primary-btn" type="submit" disabled>Unlock</button>
          </form>
          <p class="status" role="status">Unlock tools are temporarily disabled while this section is under construction.</p>
        </section>

        <button
          class="shooting-star ${state.cometVisible ? 'is-visible' : ''}"
          id="shooting-star"
          type="button"
          aria-label="Shooting star"
        ></button>
      </section>

      ${overlayMarkup()}
      ${state.panel === 'achievements' ? achievementsPageMarkup() : ''}

      <button class="hidden-star" type="button" id="hidden-star" aria-label="Hidden star">*</button>
      ${state.starMessage ? '<p class="secret-toast">You found a tiny star that remembers everything.</p>' : ''}
      ${state.secretMessage ? '<p class="secret-toast">Secret phrase accepted. A quiet page listens.</p>' : ''}
      ${state.easterToast ? `<p class="easter-toast">${state.easterToast}</p>` : ''}
      ${state.novaFlash ? '<div class="nova-flash" aria-hidden="true"></div>' : ''}

      <footer class="site-footer" id="site-footer">Updated here and then :D</footer>
    </section>
  `;
}

function cleanupGateListener() {
  if (!gateKeyHandler) return;
  window.removeEventListener('keydown', gateKeyHandler);
  gateKeyHandler = null;
}

function stopConstellationMotion() {
  if (motionFrame) {
    window.cancelAnimationFrame(motionFrame);
    motionFrame = null;
  }
}

function bindGateListener() {
  cleanupGateListener();

  gateKeyHandler = (event) => {
    if (event.key === 'Enter') {
      if (gateKeyBuffer === ACCESS_CODE) {
        state.gateAttempt = 'success';
        state.gateLetters = state.gateLetters.map((item) => ({ ...item, state: 'success' }));
        render();
        if (gateAttemptTimer) clearTimeout(gateAttemptTimer);
        gateAttemptTimer = setTimeout(() => {
          state.view = 'entrance';
          state.gateAttempt = 'idle';
          state.gateLetters = [];
          render();
        }, 520);
      } else if (gateKeyBuffer) {
        state.gateAttempt = 'error';
        state.gateLetters = state.gateLetters.map((item) => ({ ...item, state: 'error' }));
        render();
        if (gateAttemptTimer) clearTimeout(gateAttemptTimer);
        gateAttemptTimer = setTimeout(() => {
          state.gateAttempt = 'idle';
          state.gateLetters = [];
          gateKeyBuffer = '';
          if (state.view === 'gate') render();
        }, 720);
      }
      if (gateKeyBuffer === ACCESS_CODE) gateKeyBuffer = '';
      return;
    }

    if (event.key === 'Backspace') {
      gateKeyBuffer = gateKeyBuffer.slice(0, -1);
      state.gateLetters = state.gateLetters.slice(0, -1);
      state.gateAttempt = 'idle';
      render();
      return;
    }

    if (event.key.length === 1) {
      const char = event.key.toUpperCase();
      gateKeyBuffer = `${gateKeyBuffer}${char}`.slice(-ACCESS_CODE.length);
      state.gateAttempt = 'idle';
      state.gateLetters = [
        ...state.gateLetters,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          char,
          x: (18 + Math.random() * 64).toFixed(2),
          y: (18 + Math.random() * 54).toFixed(2),
          rotation: (Math.random() * 110 - 55).toFixed(2),
          scale: (0.88 + Math.random() * 0.72).toFixed(2),
          delay: (Math.random() * -0.8).toFixed(2),
          state: ''
        }
      ].slice(-ACCESS_CODE.length);
      if (gateKeyBuffer === ACCESS_CODE) {
        unlockAchievement('entry_rosie');
      }
      render();
    }
  };

  window.addEventListener('keydown', gateKeyHandler);
}

function applyViewClass() {
  document.body.classList.remove('view-gate', 'view-entrance', 'view-vault');
  document.body.classList.add(`view-${state.view}`);
}

function bindGlobalSecretListener() {
  window.addEventListener('keydown', (event) => {
    if (state.view === 'gate') return;
    const key = event.key.toUpperCase();
    konamiBuffer = [...konamiBuffer, key].slice(-KONAMI_CODE.length);

    if (konamiBuffer.join('|') === KONAMI_CODE.join('|')) {
      state.stardustMode = !state.stardustMode;
      unlockAchievement('secret_konami');
      if (state.view === 'vault') {
        showEasterToast(state.stardustMode ? 'Stardust mode awakened.' : 'Stardust mode settled back down.');
      }
    }

    if (event.key.length !== 1) return;
    secretTypeBuffer = `${secretTypeBuffer}${key}`.slice(-SECRET_WORD.length);
    orbitTypeBuffer = `${orbitTypeBuffer}${key}`.slice(-ORBIT_WORD.length);
    novaTypeBuffer = `${novaTypeBuffer}${key}`.slice(-NOVA_WORD.length);
    wishTypeBuffer = `${wishTypeBuffer}${key}`.slice(-WISH_WORD.length);
    roseTypeBuffer = `${roseTypeBuffer}${key}`.slice(-ROSE_WORD.length);

    if (secretTypeBuffer === SECRET_WORD) {
      state.secretMessage = true;
      unlockAchievement('secret_starlight');
      if (state.view === 'vault') render();
    }

    if (orbitTypeBuffer === ORBIT_WORD) {
      motionState.speedBoostUntil = Date.now() + 6000;
      unlockAchievement('secret_orbit');
      if (state.view === 'vault') {
        showEasterToast('Orbit pattern recognized.');
      }
    }

    if (novaTypeBuffer === NOVA_WORD && state.view === 'vault') {
      unlockAchievement('secret_nova');
      pulseNova();
      showEasterToast('A tiny nova bloomed and vanished.');
    }

    if (wishTypeBuffer === WISH_WORD && state.view === 'vault') {
      unlockAchievement('secret_wish');
      state.cometVisible = true;
      render();
      if (cometTimer) clearTimeout(cometTimer);
      cometTimer = setTimeout(() => {
        state.cometVisible = false;
        if (state.view === 'vault') render();
      }, 2400);
      showEasterToast('A wish invited a comet.');
    }

    if (roseTypeBuffer === ROSE_WORD && state.view === 'vault') {
      state.roseMode = !state.roseMode;
      unlockAchievement('secret_rose');
      document.body.classList.toggle('is-rose-mode', state.roseMode);
      showEasterToast(state.roseMode ? 'Rose tint found.' : 'Rose tint faded.');
      render();
    }
  });
}

function openSection(id) {
  if (!id) return;
  const section = detailById(id);
  if (!section || !isDetailUnlocked(section)) return;
  state.selectedId = id;
  state.panel = 'vault';
  render();
}

function closeOverlay() {
  if (!state.selectedId) return;
  state.selectedId = null;
  render();
}

function focusChapterSystem(id) {
  const chapter = sectionById.get(id);
  if (!chapter || chapter.type !== 'year' || !isUnlocked(chapter)) return;
  state.systemId = id;
  state.selectedId = null;
  state.panel = 'vault';
  render();
}

function closeChapterSystem() {
  if (!state.systemId) return;
  state.systemId = null;
  state.selectedId = null;
  render();
}

function openAchievements() {
  state.panel = 'achievements';
  render();
}

function closeAchievements() {
  state.panel = 'vault';
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
  if (!stage || !camera) return;

  motionState.dragging = false;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const nodeEntries = sections
    .map((item) => {
      const el = stage.querySelector(`.memory-node[data-node-id="${item.id}"]`);
      const pos = NODE_LAYOUT[item.id];
      if (!el || !pos) return null;
      return { item, el, pos };
    })
    .filter(Boolean);
  const satelliteEntries = state.systemId
    ? (CHAPTER_SYSTEMS.get(state.systemId) || [])
        .map((item) => {
          const el = stage.querySelector(`.memory-node[data-satellite-id="${item.id}"]`);
          return el ? { item, el } : null;
        })
        .filter(Boolean)
    : [];

  const lineEntries = NETWORK_CONNECTIONS.map(([from, to]) => {
    const el = stage.querySelector(`.constellation-line[data-link-from="${from}"][data-link-to="${to}"]`);
    return el ? { from, to, el } : null;
  }).filter(Boolean);

  const project = (point, width, height, cameraDistance) => {
    const zDepth = point.z + cameraDistance;
    const perspective = cameraDistance / Math.max(120, zDepth);
    return {
      x: point.x * perspective + width / 2,
      y: point.y * perspective + height / 2,
      scale: perspective
    };
  };

  const hoverNeighbors = motionState.hoveredId ? neighborMap.get(motionState.hoveredId) || new Set() : new Set();

  stage.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.memory-node, .overlay-panel, .detail-overlay__panel, .hidden-star, .shooting-star')) {
      return;
    }
    motionState.dragging = true;
    motionState.dragMoved = false;
    motionState.lastX = event.clientX;
    motionState.lastY = event.clientY;
    stage.classList.add('is-dragging');
    stage.setPointerCapture?.(event.pointerId);
  });

  stage.addEventListener('pointermove', (event) => {
    const rect = stage.getBoundingClientRect();
    const nx = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const ny = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    motionState.cursorYaw = (nx - 0.5) * 0.28;
    motionState.cursorPitch = (ny - 0.5) * 0.16;

    if (!motionState.dragging) return;
    const dx = event.clientX - motionState.lastX;
    const dy = event.clientY - motionState.lastY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      motionState.dragMoved = true;
    }
    motionState.lastX = event.clientX;
    motionState.lastY = event.clientY;
    motionState.userYaw += dx * 0.0048;
    motionState.userPitch = clamp(motionState.userPitch + dy * 0.0038, -0.9, 0.9);
  });

  const stopDrag = () => {
    motionState.dragging = false;
    motionState.dragMoved = false;
    stage.classList.remove('is-dragging');
  };

  stage.addEventListener('pointerup', stopDrag);
  stage.addEventListener('pointercancel', stopDrag);
  stage.addEventListener('mouseleave', () => {
    motionState.cursorYaw = 0;
    motionState.cursorPitch = 0;
    stopDrag();
  });
  stage.addEventListener('dblclick', (event) => {
    if (event.target.closest('.memory-node, .overlay-panel, .detail-overlay__panel')) return;
    unlockAchievement('empty_space_comet');
    state.cometVisible = true;
    if (cometTimer) clearTimeout(cometTimer);
    showEasterToast(EASTER_MESSAGES[Math.floor(Math.random() * EASTER_MESSAGES.length)], 2200);
    render();
    cometTimer = setTimeout(() => {
      state.cometVisible = false;
      if (state.view === 'vault') render();
    }, 2200);
  });

  nodeEntries.forEach(({ item, el }) => {
    el.addEventListener('mouseenter', () => {
      motionState.hoveredId = item.id;
      applyNetworkHighlight();
    });

    el.addEventListener('mouseleave', () => {
      motionState.hoveredId = null;
      applyNetworkHighlight();
    });
  });

  satelliteEntries.forEach(({ item, el }) => {
    el.addEventListener('mouseenter', () => {
      motionState.hoveredId = item.id;
      applyNetworkHighlight();
    });

    el.addEventListener('mouseleave', () => {
      motionState.hoveredId = null;
      applyNetworkHighlight();
    });
  });

  function applyNetworkHighlight() {
    const hoveredId = motionState.hoveredId;
    const related = hoveredId ? neighborMap.get(hoveredId) || new Set() : new Set();

    nodeEntries.forEach(({ item, el }) => {
      const isHovered = item.id === hoveredId;
      const isNeighbor = hoveredId ? related.has(item.id) : false;
      el.classList.toggle('is-hovered', isHovered);
      el.classList.toggle('is-neighbor', isNeighbor);
    });

    satelliteEntries.forEach(({ item, el }) => {
      const isHovered = item.id === hoveredId;
      el.classList.toggle('is-hovered', isHovered);
      el.classList.toggle('is-neighbor', Boolean(state.systemId) && item.parentId === state.systemId && hoveredId === state.systemId);
    });

    lineEntries.forEach(({ from, to, el }) => {
      const active = hoveredId ? from === hoveredId || to === hoveredId : false;
      const relatedLine = hoveredId ? related.has(from) && to === hoveredId || related.has(to) && from === hoveredId : false;
      el.classList.toggle('is-active', active || relatedLine);
      el.classList.toggle('is-dimmed', (hoveredId && !active && !relatedLine) || (state.systemId && from !== state.systemId && to !== state.systemId));
    });
  }

  applyNetworkHighlight();

  let lastTime = 0;
  const loop = (time) => {
    if (!lastTime) lastTime = time;
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    const baseTurn = (Math.PI * 2) / 86;
    const selectedLayout = state.systemId ? NODE_LAYOUT[state.systemId] : state.selectedId ? NODE_LAYOUT[state.selectedId] : null;
    const boosted = Date.now() < motionState.speedBoostUntil ? 1.85 : 1;
    const speedMultiplier = (state.selectedId ? 0.16 : motionState.hoveredId ? 0.45 : 1) * boosted;
    motionState.rotationY += baseTurn * speedMultiplier * delta;

    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const camDist = Math.max(720, width * 1.28);
    const totalYaw = motionState.rotationY + motionState.userYaw + motionState.cursorYaw;
    const totalPitch = 0.1 + motionState.userPitch + motionState.cursorPitch;
    const cosY = Math.cos(totalYaw);
    const sinY = Math.sin(totalYaw);
    const cosX = Math.cos(totalPitch);
    const sinX = Math.sin(totalPitch);

    const rotatePoint = (point) => {
      const x1 = point.x * cosY - point.z * sinY;
      const z1 = point.x * sinY + point.z * cosY;
      const y2 = point.y * cosX - z1 * sinX;
      const z2 = point.y * sinX + z1 * cosX;
      return { x: x1, y: y2, z: z2 };
    };

    const projectedPoints = new Map();
    nodeEntries.forEach(({ item, el, pos }, index) => {
      const bob = Math.sin(time * 0.0005 + index * 0.8) * 10;
      const sway = Math.cos(time * 0.00036 + index * 0.9) * 6;
      const basePoint = {
        x: pos.x + sway,
        y: pos.y + bob,
        z: pos.z
      };
      const point = rotatePoint(basePoint);
      const projected = project(point, width, height, camDist);
      projectedPoints.set(item.id, { projected, point, basePoint });

      const baseScale = pos.size === 'large' ? 1.1 : pos.size === 'medium' ? 0.92 : 0.8;
      const totalScale = Math.max(0.55, Math.min(1.48, baseScale * projected.scale));
      el.style.transform = `translate3d(${projected.x.toFixed(2)}px, ${projected.y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${totalScale.toFixed(3)})`;
      el.style.zIndex = `${Math.round(1000 + point.z)}`;
      el.style.opacity = state.systemId ? (item.id === state.systemId ? '1' : item.type === 'year' ? '0.18' : '0.1') : '1';
    });

    const focusedChapter = state.systemId ? projectedPoints.get(state.systemId) : null;
    satelliteEntries.forEach(({ item, el }, index) => {
      if (!focusedChapter) return;
      const angle = time * 0.00055 * item.orbitSpeed + item.phase;
      const wobble = Math.sin(time * 0.0008 + index * 1.1) * 6;
      const basePoint = {
        x: focusedChapter.basePoint.x + Math.cos(angle) * item.orbitRadius,
        y: focusedChapter.basePoint.y + Math.sin(angle * 1.3 + item.phase) * item.orbitHeight + wobble,
        z: focusedChapter.basePoint.z + Math.sin(angle) * item.orbitRadius * 0.46
      };
      const point = rotatePoint(basePoint);
      const projected = project(point, width, height, camDist);
      const totalScale = Math.max(0.48, Math.min(1.12, 0.58 * projected.scale));

      el.style.transform = `translate3d(${projected.x.toFixed(2)}px, ${projected.y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${totalScale.toFixed(3)})`;
      el.style.zIndex = `${Math.round(1250 + point.z)}`;
      el.style.opacity = '1';
    });

    lineEntries.forEach(({ from, to, el }) => {
      const a = projectedPoints.get(from);
      const b = projectedPoints.get(to);
      if (!a || !b) return;

      el.setAttribute('x1', ((a.projected.x / width) * 100).toFixed(3));
      el.setAttribute('y1', ((a.projected.y / height) * 100).toFixed(3));
      el.setAttribute('x2', ((b.projected.x / width) * 100).toFixed(3));
      el.setAttribute('y2', ((b.projected.y / height) * 100).toFixed(3));
      const depth = (a.point.z + b.point.z) / 2;
      const baseOpacity = Math.max(0.12, Math.min(0.82, 0.34 + depth / 1000));
      const systemMultiplier = state.systemId && from !== state.systemId && to !== state.systemId ? 0.18 : 1;
      el.style.opacity = `${baseOpacity * systemMultiplier}`;
    });

    let targetX = 0;
    let targetY = 0;
    let targetZoom = 1;

    if (selectedLayout) {
      const focusId = state.systemId || state.selectedId;
      const focused = projectedPoints.get(focusId);
      if (focused) {
        targetX = (width / 2 - focused.projected.x) * (state.systemId ? 0.18 : 0.08);
        targetY = (height / 2 - focused.projected.y) * (state.systemId ? 0.14 : 0.06);
      }
      targetZoom = state.systemId ? 1.24 : 1.08;
    } else if (motionState.hoveredId) {
      targetZoom = Math.max(targetZoom, 1.02);
    }

    camera.style.setProperty('--cam-x', `${targetX.toFixed(2)}px`);
    camera.style.setProperty('--cam-y', `${targetY.toFixed(2)}px`);
    camera.style.setProperty('--cam-zoom', targetZoom.toFixed(3));

    motionFrame = window.requestAnimationFrame(loop);
  };

  motionFrame = window.requestAnimationFrame(loop);
}

function bindVaultEvents() {
  app.querySelectorAll('[data-open-id]').forEach((button) => {
    button.addEventListener('click', () => {
      if (motionState.dragMoved) {
        return;
      }
      const id = button.getAttribute('data-open-id');
      if (!id) {
        const nodeId = button.getAttribute('data-node-id');
        const indexId = button.getAttribute('data-index-id');
        const lookupId = nodeId || indexId;
        const item = lookupId ? sectionById.get(lookupId) : null;
        state.status = item ? lockLabel(item) : 'Locked for now.';
        render();
        return;
      }

      const item = detailById(id);
      if (item?.type === 'year') {
        if (state.systemId === id) {
          openSection(id);
          return;
        }
        focusChapterSystem(id);
        return;
      }

      openSection(id);
    });
  });

  app.querySelectorAll('[data-open-detail]').forEach((button) => {
    button.addEventListener('click', () => {
      if (motionState.dragMoved) return;
      const id = button.getAttribute('data-open-detail');
      openSection(id);
    });
  });

  app.querySelectorAll('[data-close-system]').forEach((button) => {
    button.addEventListener('click', () => {
      if (motionState.dragMoved) return;
      closeChapterSystem();
    });
  });

  app.querySelectorAll('[data-close-overlay]').forEach((button) => {
    button.addEventListener('click', () => {
      if (motionState.dragMoved) {
        return;
      }
      closeOverlay();
    });
  });
  app.querySelectorAll('[data-close-achievements]').forEach((button) => {
    button.addEventListener('click', () => {
      if (motionState.dragMoved) {
        return;
      }
      closeAchievements();
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
    state.status = newUnlocks.length ? 'New memory unlocked.' : 'That code was already used.';

    if (newUnlocks.length) {
      triggerUnlockFlash(newUnlocks);
      return;
    }

    render();
  });

  document.getElementById('hidden-star')?.addEventListener('click', () => {
    if (motionState.dragMoved) {
      return;
    }
    motionState.starTapCount += 1;
    state.starMessage = !state.starMessage;
    if (motionState.starTapCount === 7) {
      unlockAchievement('star_tapper');
      showEasterToast('Seven taps. The archive will remember that.');
      motionState.starTapCount = 0;
    } else {
      render();
    }
  });

  document.getElementById('archive-title')?.addEventListener('click', () => {
    if (motionState.dragMoved) {
      return;
    }
    motionState.heroTapCount += 1;
    if (motionState.heroTapCount >= 5) {
      motionState.heroTapCount = 0;
      unlockAchievement('title_tapper');
      showEasterToast('The archive blinked back.');
      document.title = 'The Archive Blinked Back';
    }
  });

  document.getElementById('archive-subtle')?.addEventListener('dblclick', () => {
    if (motionState.dragMoved) {
      return;
    }
    unlockAchievement('subtitle_double');
    showEasterToast('Double meanings live in quiet lines.');
  });

  document.getElementById('archive-index-title')?.addEventListener('click', () => {
    if (motionState.dragMoved) {
      return;
    }
    motionState.indexTapCount += 1;
    if (motionState.indexTapCount >= 4) {
      motionState.indexTapCount = 0;
      unlockAchievement('index_tapper');
      state.wishMode = !state.wishMode;
      document.body.classList.toggle('is-wish-mode', state.wishMode);
      showEasterToast(state.wishMode ? 'Wish mode drifted in.' : 'Wish mode drifted away.');
      return;
    }
    showEasterToast('The index rustled softly.', 1100);
  });

  document.getElementById('shooting-star')?.addEventListener('click', () => {
    if (motionState.dragMoved) {
      return;
    }
    unlockAchievement('shooting_star');
    state.cometVisible = false;
    showEasterToast('You caught the shooting star.');
    render();
  });

  document.getElementById('site-footer')?.addEventListener('click', () => {
    if (motionState.dragMoved) {
      return;
    }
    motionState.footerTapCount += 1;
    if (motionState.footerTapCount >= 3) {
      motionState.footerTapCount = 0;
      unlockAchievement('footer_tapper');
      pulseNova(1200);
      showEasterToast('March 9 remembers you too.');
      return;
    }
    showEasterToast('Time noticed.', 900);
  });

  document.getElementById('open-achievements')?.addEventListener('click', () => {
    if (motionState.dragMoved) {
      return;
    }
    openAchievements();
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
  stopConstellationMotion();
  applyViewClass();

  if (state.view === 'gate') {
    app.innerHTML = gateMarkup();
    bindGateListener();
    return;
  }

  cleanupGateListener();

  if (state.view === 'entrance') {
    app.innerHTML = entranceMarkup();
    bindEntranceEvents();
    return;
  }

  state.view = 'vault';
  applyViewClass();
  app.innerHTML = vaultMarkup();
  document.body.classList.toggle('is-stardust-mode', state.stardustMode);
  document.body.classList.toggle('is-rose-mode', state.roseMode);
  document.body.classList.toggle('is-wish-mode', state.wishMode);
  bindVaultEvents();
}

window.addEventListener('mousemove', (event) => {
  const x = (event.clientX / window.innerWidth) * 100;
  const y = (event.clientY / window.innerHeight) * 100;
  document.body.style.setProperty('--mx', `${x.toFixed(2)}%`);
  document.body.style.setProperty('--my', `${y.toFixed(2)}%`);
});

window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (state.selectedId) {
    closeOverlay();
    return;
  }
  if (state.panel === 'achievements') {
    closeAchievements();
    return;
  }
  if (state.systemId) {
    closeChapterSystem();
  }
});

bindGlobalSecretListener();
render();
