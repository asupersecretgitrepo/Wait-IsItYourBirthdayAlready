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
const GALLERY_DB_NAME = 'time_capsule_gallery';
const GALLERY_STORE_NAME = 'photos';
const GALLERY_SPECIAL_ID = 'special-gallery';
const CHAPTER_SATELLITES_UNDER_CONSTRUCTION_ID = 'year-2026';
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

function seededUnit(seed) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function seededRange(seed, min, max) {
  return min + seededUnit(seed) * (max - min);
}

function randomizeSatelliteOrbit(item, chapterId) {
  const seedRoot = `${chapterId}:${item.id}`;
  const speedSign = item.orbitSpeed < 0 ? -1 : 1;

  return {
    ...item,
    orbitRadius: item.orbitRadius * seededRange(`${seedRoot}:radius`, 0.88, 1.18),
    orbitHeight: item.orbitHeight * seededRange(`${seedRoot}:height`, 0.72, 1.52),
    orbitSpeed: speedSign * Math.max(0.34, Math.abs(item.orbitSpeed) * seededRange(`${seedRoot}:speed`, 0.82, 1.34)),
    phase: item.phase + seededRange(`${seedRoot}:phase`, -0.95, 1.45),
    orbitTilt: seededRange(`${seedRoot}:tilt`, -0.9, 0.9),
    orbitStretch: seededRange(`${seedRoot}:stretch`, 0.72, 1.38),
    orbitDepth: seededRange(`${seedRoot}:depth`, 0.24, 0.82),
    orbitWobble: seededRange(`${seedRoot}:wobble`, 2, 10),
    orbitLift: seededRange(`${seedRoot}:lift`, -18, 18)
  };
}

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

  return satellites.map((item) => randomizeSatelliteOrbit(item, chapter.id));
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
  galleryPhotos: [],
  galleryStatus: '',
  galleryLoading: false,
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
let viewTransitionActive = false;
let galleryDbPromise = null;
const motionState = {
  rotationY: 0,
  cursorYaw: 0,
  cursorPitch: 0,
  userYaw: 0,
  userPitch: 0,
  camX: 0,
  camY: 0,
  camZoom: 1,
  zoom: 1,
  dragging: false,
  dragMoved: false,
  lastX: 0,
  lastY: 0,
  activePointers: new Map(),
  pinchDistance: 0,
  pinchZoomStart: 1,
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

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function todayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatContributionDate(value) {
  if (!value) return 'Unknown date';
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

function defaultGalleryPlacement(index = 0) {
  const column = index % 3;
  const row = Math.floor(index / 3) % 4;
  const x = 22 + column * 26 + ((index * 17) % 7) - 3;
  const y = 20 + row * 18 + ((index * 13) % 9) - 4;
  const rotation = ((index * 11) % 18) - 9;
  return {
    boardX: Math.max(12, Math.min(88, x)),
    boardY: Math.max(14, Math.min(84, y)),
    rotation
  };
}

function galleryPlacement(photo, index = 0) {
  if (typeof photo.boardX === 'number' && typeof photo.boardY === 'number') {
    return {
      boardX: photo.boardX,
      boardY: photo.boardY,
      rotation: typeof photo.rotation === 'number' ? photo.rotation : 0
    };
  }
  return defaultGalleryPlacement(index);
}

function openGalleryDatabase() {
  if (galleryDbPromise) return galleryDbPromise;

  galleryDbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }

    const request = window.indexedDB.open(GALLERY_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(GALLERY_STORE_NAME)) {
        db.createObjectStore(GALLERY_STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open gallery storage.'));
  });

  return galleryDbPromise;
}

function readAllGalleryPhotos() {
  return openGalleryDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(GALLERY_STORE_NAME, 'readonly');
        const store = tx.objectStore(GALLERY_STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => {
          const photos = Array.isArray(request.result) ? request.result : [];
          photos.sort((a, b) => (b.contributedAt || b.createdAt || 0) - (a.contributedAt || a.createdAt || 0));
          resolve(photos);
        };
        request.onerror = () => reject(request.error || new Error('Failed to load gallery photos.'));
      })
  );
}

function writeGalleryPhoto(photo) {
  return openGalleryDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(GALLERY_STORE_NAME, 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error('Failed to save photo.'));
        tx.objectStore(GALLERY_STORE_NAME).put(photo);
      })
  );
}

function deleteGalleryPhotoRecord(id) {
  return openGalleryDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(GALLERY_STORE_NAME, 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error('Failed to delete photo.'));
        tx.objectStore(GALLERY_STORE_NAME).delete(id);
      })
  );
}

function loadGalleryPhotos() {
  state.galleryLoading = true;
  return readAllGalleryPhotos()
    .then((photos) => {
      state.galleryPhotos = photos;
      state.galleryStatus = photos.length ? '' : state.galleryStatus;
    })
    .catch(() => {
      state.galleryStatus = 'Gallery storage could not be opened in this browser.';
    })
    .finally(() => {
      state.galleryLoading = false;
      if (state.view === 'vault') render();
    });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Could not read the image.'));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load the uploaded image.'));
    image.src = src;
  });
}

async function normalizeGalleryImage(file) {
  const dataUrl = await fileToDataUrl(file);
  const image = await loadImageElement(dataUrl);
  const maxSide = 1800;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, width, height);
  const optimized = canvas.toDataURL('image/webp', 0.9);
  return {
    src: optimized,
    width,
    height
  };
}

async function handleGalleryUpload(fileList, options = {}) {
  const files = Array.from(fileList || []).filter((file) => file.type.startsWith('image/'));
  if (!files.length) {
    state.galleryStatus = 'Choose one or more image files first.';
    render();
    return;
  }

  const note = String(options.note || '').trim();
  const contributedOn = String(options.contributedOn || todayInputValue()).trim() || todayInputValue();
  const contributedAt = new Date(`${contributedOn}T00:00:00`).getTime();

  state.galleryLoading = true;
  state.galleryStatus = files.length === 1 ? 'Saving photo...' : `Saving ${files.length} photos...`;
  render();

  let savedCount = 0;
  const startingCount = state.galleryPhotos.length;

  try {
    for (const file of files) {
      const normalized = await normalizeGalleryImage(file);
      const placement = defaultGalleryPlacement(startingCount + savedCount);
      await writeGalleryPhoto({
        id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: file.name || 'Uploaded Photo',
        alt: `Uploaded memory photo: ${file.name || 'Untitled'}`,
        src: normalized.src,
        width: normalized.width,
        height: normalized.height,
        note,
        contributedOn,
        contributedAt: Number.isNaN(contributedAt) ? Date.now() : contributedAt,
        boardX: placement.boardX,
        boardY: placement.boardY,
        rotation: placement.rotation,
        createdAt: Date.now()
      });
      savedCount += 1;
    }

    await loadGalleryPhotos();
    state.galleryStatus = savedCount === 1 ? 'Photo saved to the gallery.' : `${savedCount} photos saved to the gallery.`;
  } catch {
    state.galleryLoading = false;
    state.galleryStatus = 'That upload did not finish. Try a different image.';
    render();
    return;
  }

  state.galleryLoading = false;
  render();
}

async function handleGalleryDelete(id) {
  if (!id) return;
  state.galleryStatus = 'Removing photo...';
  render();

  try {
    await deleteGalleryPhotoRecord(id);
    await loadGalleryPhotos();
    state.galleryStatus = 'Photo removed from the gallery.';
  } catch {
    state.galleryStatus = 'That photo could not be removed right now.';
  }

  render();
}

async function updateGalleryPhotoLayout(id, patch = {}) {
  const current = state.galleryPhotos.find((photo) => photo.id === id);
  if (!current) return;
  const nextPhoto = { ...current, ...patch };
  state.galleryPhotos = state.galleryPhotos.map((photo) => (photo.id === id ? nextPhoto : photo));

  try {
    await writeGalleryPhoto(nextPhoto);
  } catch {
    state.galleryStatus = 'That photo position could not be saved.';
    render();
  }
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

function isMemoryTemporarilyLocked(item) {
  if (!item) return false;
  return item.type === 'satellite' && item.parentId === CHAPTER_SATELLITES_UNDER_CONSTRUCTION_ID;
}

function isChapterDetailTemporarilyLocked(item) {
  if (!item) return false;
  return item.type === 'year' && item.id === CHAPTER_SATELLITES_UNDER_CONSTRUCTION_ID;
}

function isDetailTemporarilyLocked(item) {
  return isMemoryTemporarilyLocked(item) || isChapterDetailTemporarilyLocked(item);
}

function isUnlocked(item) {
  if (isMemoryTemporarilyLocked(item)) return false;
  if (item.type === 'year') return isYearUnlocked(item);
  if (item.defaultUnlocked) return true;
  return unlockedSpecials.has(item.id);
}

function detailById(id) {
  return sectionById.get(id) || satelliteById.get(id) || null;
}

function isDetailUnlocked(item) {
  if (!item) return false;
  if (isDetailTemporarilyLocked(item)) return false;
  if (item.type === 'satellite') {
    return isUnlocked(sectionById.get(item.parentId));
  }
  return isUnlocked(item);
}

function lockLabel(item) {
  if (isMemoryTemporarilyLocked(item)) return 'Under Construction';
  if (isUnlocked(item)) return 'Open';
  return item.unlockLabel || 'Locked';
}

function statusLabel(item) {
  if (isDetailTemporarilyLocked(item)) return 'Under Construction';
  return lockLabel(item);
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
          <span>80%</span>
        </div>
        <div class="completion-progress__track">
          <span class="completion-progress__fill" style="width: 80%;"></span>
        </div>
      </footer>
    </section>
  `;
}

function gateLettersMarkup() {
  return state.gateLetters
    .map(
      (item) => `
        <span
          class="gate-letter ${item.state ? `is-${item.state}` : ''}"
          style="left:${item.x}%;top:${item.y}%;--rot:${item.rotation}deg;transform:translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale});animation-delay:${item.delay}s;"
        >${item.char}</span>
      `
    )
    .join('');
}

function syncGateVisuals() {
  const gateLetters = document.querySelector('.gate-letters');
  if (!gateLetters) return;

  gateLetters.classList.toggle('is-success', state.gateAttempt === 'success');
  gateLetters.classList.toggle('is-error', state.gateAttempt === 'error');
  gateLetters.innerHTML = gateLettersMarkup();
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

function galleryDetailMarkup(item) {
  const photosMarkup = state.galleryPhotos.length
    ? state.galleryPhotos
        .map(
          (photo, index) => {
            const placement = galleryPlacement(photo, index);
            return `
            <figure
              class="gallery-photo-card"
              data-gallery-photo-id="${photo.id}"
              style="left:${placement.boardX}%;top:${placement.boardY}%;--photo-rot:${placement.rotation}deg;"
            >
              <img src="${photo.src}" alt="${escapeHtml(photo.alt)}" loading="lazy" />
              <figcaption>
                <div>
                  <small>Added ${formatContributionDate(photo.contributedOn || '')}</small>
                  ${photo.note ? `<p class="gallery-photo-card__note">${escapeHtml(photo.note)}</p>` : '<p class="gallery-photo-card__note is-empty">No note yet.</p>'}
                </div>
                <button class="ghost-btn gallery-photo-card__delete" type="button" data-delete-gallery-photo="${photo.id}">
                  Delete
                </button>
              </figcaption>
            </figure>
          `;
          }
        )
        .join('')
    : `
        <div class="gallery-empty gallery-board__empty">
          <p>No uploaded photos yet.</p>
          <small>The first upload will stay here on this browser and device.</small>
        </div>
      `;

  return `
    <aside class="detail-overlay" aria-label="Gallery detail">
      <div class="detail-overlay__backdrop" data-close-overlay="true"></div>
      <article class="detail-overlay__panel detail-overlay__panel--gallery">
        <button class="ghost-btn detail-overlay__close" type="button" data-close-overlay="true">Close</button>
        <p class="eyebrow">Special Unlock</p>
        <h2>${item.title}</h2>
        <p class="subtle">${item.summary}</p>
        <section class="gallery-manager">
          <div class="gallery-manager__header">
            <div>
              <h3>Upload photos</h3>
              <p>Photos added here stay saved in this site on this browser unless someone deletes them. Drag them around the board anywhere you want.</p>
            </div>
            <label class="primary-btn gallery-upload-btn" for="gallery-upload-input">Upload Photos</label>
          </div>
          <div class="gallery-manager__fields">
            <label class="gallery-field">
              <span>Contribution date</span>
              <input id="gallery-contribution-date" type="date" value="${todayInputValue()}" />
            </label>
            <label class="gallery-field gallery-field--note">
              <span>Little note</span>
              <textarea id="gallery-note" rows="3" maxlength="220" placeholder="A tiny note about this photo..."></textarea>
            </label>
          </div>
          <input id="gallery-upload-input" class="gallery-upload-input" type="file" accept="image/*" multiple />
          ${state.galleryStatus ? `<p class="status gallery-status">${state.galleryStatus}</p>` : ''}
        </section>
        <section class="gallery-board" id="gallery-board" aria-label="Uploaded gallery photo board">
          ${state.galleryLoading ? '<p class="gallery-loading">Loading saved photos...</p>' : photosMarkup}
        </section>
      </article>
    </aside>
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

function systemNodeMarkup() {
  const chapterIds = state.systemId ? [state.systemId] : YEAR_CHAPTERS.map((chapter) => chapter.id);

  return chapterIds
    .flatMap((chapterId) => {
      const satellites = CHAPTER_SYSTEMS.get(chapterId) || [];
      const chapter = sectionById.get(chapterId);

      return satellites.map(
        (item) => {
          const unlocked = isDetailUnlocked(item);
          return `
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
        `;
        }
      );
    })
    .join('');
}

function chapterSystemPanelMarkup() {
  if (!state.systemId) return '';
  const chapter = sectionById.get(state.systemId);
  const satellites = CHAPTER_SYSTEMS.get(state.systemId) || [];
  if (!chapter) return '';
  const showConstructionNotice = chapter.id === CHAPTER_SATELLITES_UNDER_CONSTRUCTION_ID;
  const chapterDetailUnlocked = isDetailUnlocked(chapter);

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
        <button
          class="archive-index__item ${chapterDetailUnlocked ? 'is-unlocked' : 'is-locked'} chapter-system__core-btn"
          type="button"
          data-open-id="${chapterDetailUnlocked ? chapter.id : ''}"
          data-index-id="${chapter.id}"
        >
          <span class="archive-index__meta">${chapter.year}</span>
          <strong>Open Main Chapter</strong>
          <small>${chapterDetailUnlocked ? chapter.summary : 'Opening soon.'}</small>
        </button>
      </div>
      ${
        showConstructionNotice
          ? `
            <div class="archive-construction">
              <div class="construction-banner" aria-label="Chapter memories under construction notice">
                <span>Under Construction</span>
              </div>
              <p class="section-note">The main chapter and the smaller memories orbiting Chapter 2026 are still being assembled.</p>
            </div>
          `
          : ''
      }
      <div class="chapter-system__list">
        ${satellites
          .map((item) => {
            const unlocked = isDetailUnlocked(item);
            return `
              <button
                class="archive-index__item ${unlocked ? 'is-unlocked' : 'is-locked'} chapter-system__item"
                type="button"
                data-open-id="${unlocked ? item.id : ''}"
                data-index-id="${item.id}"
              >
                <span class="archive-index__meta">Orbit</span>
                <strong>${item.title}</strong>
                <small>${item.summary}</small>
              </button>
            `;
          })
          .join('')}
      </div>
    </section>
  `;
}

function overlayMarkup() {
  if (!state.selectedId) return '';
  const item = detailById(state.selectedId);
  if (!item || !isDetailUnlocked(item)) return '';
  if (item.id === GALLERY_SPECIAL_ID) return galleryDetailMarkup(item);
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
    <section class="vault-view ${state.systemId ? 'is-system-focus' : ''}">
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
              ${systemNodeMarkup()}
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
          ${state.status ? `<p class="status archive-status">${state.status}</p>` : ''}
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
        syncGateVisuals();
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
        syncGateVisuals();
        if (gateAttemptTimer) clearTimeout(gateAttemptTimer);
        gateAttemptTimer = setTimeout(() => {
          state.gateAttempt = 'idle';
          state.gateLetters = [];
          gateKeyBuffer = '';
          if (state.view === 'gate') syncGateVisuals();
        }, 720);
      }
      if (gateKeyBuffer === ACCESS_CODE) gateKeyBuffer = '';
      return;
    }

    if (event.key === 'Backspace') {
      gateKeyBuffer = gateKeyBuffer.slice(0, -1);
      state.gateLetters = state.gateLetters.slice(0, -1);
      state.gateAttempt = 'idle';
      syncGateVisuals();
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
      syncGateVisuals();
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
  if (!section) return;
  if (!isDetailUnlocked(section)) {
    state.status = statusLabel(section);
    render();
    return;
  }
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
  camera.style.setProperty('--cam-x', `${motionState.camX.toFixed(2)}px`);
  camera.style.setProperty('--cam-y', `${motionState.camY.toFixed(2)}px`);
  camera.style.setProperty('--cam-zoom', motionState.camZoom.toFixed(3));

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const setZoom = (nextZoom) => {
    motionState.zoom = clamp(nextZoom, 0.72, 1.85);
  };
  const pointerDistance = () => {
    const points = Array.from(motionState.activePointers.values());
    if (points.length < 2) return 0;
    const [a, b] = points;
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  const nodeEntries = sections
    .map((item) => {
      const el = stage.querySelector(`.memory-node[data-node-id="${item.id}"]`);
      const pos = NODE_LAYOUT[item.id];
      if (!el || !pos) return null;
      return { item, el, pos };
    })
    .filter(Boolean);
  const visibleSatellites = state.systemId ? CHAPTER_SYSTEMS.get(state.systemId) || [] : Array.from(CHAPTER_SYSTEMS.values()).flat();
  const satelliteEntries = visibleSatellites
    .map((item) => {
      const el = stage.querySelector(`.memory-node[data-satellite-id="${item.id}"]`);
      return el ? { item, el } : null;
    })
    .filter(Boolean);

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
    motionState.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (motionState.activePointers.size === 2) {
      motionState.pinchDistance = pointerDistance();
      motionState.pinchZoomStart = motionState.zoom;
      motionState.dragging = false;
      motionState.dragMoved = false;
      stage.classList.remove('is-dragging');
      return;
    }
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
    if (motionState.activePointers.has(event.pointerId)) {
      motionState.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }

    if (motionState.activePointers.size >= 2) {
      const nextDistance = pointerDistance();
      if (motionState.pinchDistance > 0 && nextDistance > 0) {
        const ratio = nextDistance / motionState.pinchDistance;
        setZoom(motionState.pinchZoomStart * ratio);
      }
      motionState.dragging = false;
      motionState.dragMoved = false;
      stage.classList.remove('is-dragging');
      return;
    }

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

  const clearPointer = (event) => {
    motionState.activePointers.delete(event.pointerId);
    if (motionState.activePointers.size < 2) {
      motionState.pinchDistance = 0;
      motionState.pinchZoomStart = motionState.zoom;
    }
  };

  stage.addEventListener('pointerup', (event) => {
    clearPointer(event);
    stopDrag();
  });
  stage.addEventListener('pointercancel', (event) => {
    clearPointer(event);
    stopDrag();
  });
  stage.addEventListener('mouseleave', () => {
    motionState.cursorYaw = 0;
    motionState.cursorPitch = 0;
    motionState.activePointers.clear();
    motionState.pinchDistance = 0;
    stopDrag();
  });
  stage.addEventListener(
    'wheel',
    (event) => {
      if (event.target.closest('.overlay-panel, .detail-overlay__panel')) return;
      event.preventDefault();
      const zoomDelta = event.deltaY > 0 ? -0.08 : 0.08;
      setZoom(motionState.zoom + zoomDelta);
    },
    { passive: false }
  );
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
    const selectedItem = state.selectedId ? detailById(state.selectedId) : null;
    const focusId = selectedItem?.type === 'satellite' ? state.selectedId : state.systemId || state.selectedId;
    const selectedLayout = focusId ? NODE_LAYOUT[focusId] || (state.systemId ? NODE_LAYOUT[state.systemId] : null) : null;
    const isFocused = Boolean(state.systemId || state.selectedId);
    const boosted = Date.now() < motionState.speedBoostUntil ? 1.85 : 1;
    const speedMultiplier = (isFocused ? 0 : motionState.hoveredId ? 0.45 : 1) * boosted;
    motionState.rotationY += baseTurn * speedMultiplier * delta;

    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const camDist = Math.max(720, width * 1.28);
    const focusCursorYaw = isFocused ? 0 : motionState.cursorYaw;
    const focusCursorPitch = isFocused ? 0 : motionState.cursorPitch;
    const totalYaw = motionState.rotationY + motionState.userYaw + focusCursorYaw;
    const totalPitch = 0.1 + motionState.userPitch + focusCursorPitch;
    const cosY = Math.cos(totalYaw);
    const sinY = Math.sin(totalYaw);
    const cosX = Math.cos(totalPitch);
    const sinX = Math.sin(totalPitch);

    const rotatePoint = (point, pivot) => {
      const anchor = pivot || { x: 0, y: 0, z: 0 };
      const offsetX = point.x - anchor.x;
      const offsetY = point.y - anchor.y;
      const offsetZ = point.z - anchor.z;
      const x1 = offsetX * cosY - offsetZ * sinY;
      const z1 = offsetX * sinY + offsetZ * cosY;
      const y2 = offsetY * cosX - z1 * sinX;
      const z2 = offsetY * sinX + z1 * cosX;
      return {
        x: x1 + anchor.x,
        y: y2 + anchor.y,
        z: z2 + anchor.z
      };
    };

    const rawNodePoints = new Map();
    nodeEntries.forEach(({ item, pos }, index) => {
      const isRotationAnchor = focusId === item.id || state.systemId === item.id;
      const bob = isRotationAnchor ? 0 : Math.sin(time * 0.0005 + index * 0.8) * 10;
      const sway = isRotationAnchor ? 0 : Math.cos(time * 0.00036 + index * 0.9) * 6;
      rawNodePoints.set(item.id, {
        x: pos.x + sway,
        y: pos.y + bob,
        z: pos.z
      });
    });

    const rawSatellitePoints = new Map();
    satelliteEntries.forEach(({ item }, index) => {
      const parentBasePoint = rawNodePoints.get(item.parentId);
      if (!parentBasePoint) return;
      const isSelectedSatellite = state.selectedId === item.id;
      const angle = isSelectedSatellite ? item.phase : time * 0.00055 * item.orbitSpeed + item.phase;
      const wobbleAmount = item.orbitWobble ?? 6;
      const orbitStretch = item.orbitStretch ?? 1;
      const orbitDepth = item.orbitDepth ?? 0.46;
      const orbitTilt = item.orbitTilt ?? 0;
      const wobble = isSelectedSatellite ? 0 : Math.sin(time * 0.0008 + index * 1.1) * wobbleAmount;
      const orbitX = Math.cos(angle) * item.orbitRadius * orbitStretch;
      const orbitY = Math.sin(angle * 1.3 + item.phase) * item.orbitHeight + wobble + (item.orbitLift ?? 0);
      const orbitZ = Math.sin(angle) * item.orbitRadius * orbitDepth;
      const tiltedY = orbitY * Math.cos(orbitTilt) - orbitZ * Math.sin(orbitTilt);
      const tiltedZ = orbitY * Math.sin(orbitTilt) + orbitZ * Math.cos(orbitTilt);
      rawSatellitePoints.set(item.id, {
        x: parentBasePoint.x + orbitX,
        y: parentBasePoint.y + tiltedY,
        z: parentBasePoint.z + tiltedZ
      });
    });

    const rotationPivot = selectedLayout ? rawSatellitePoints.get(focusId) || rawNodePoints.get(focusId) || null : null;
    const projectedPoints = new Map();
    const satelliteProjectedPoints = new Map();
    nodeEntries.forEach(({ item, el, pos }, index) => {
      const basePoint = rawNodePoints.get(item.id);
      const point = rotatePoint(basePoint, rotationPivot);
      const projected = project(point, width, height, camDist);
      projectedPoints.set(item.id, { projected, point, basePoint });

      const baseScale = pos.size === 'large' ? 1.1 : pos.size === 'medium' ? 0.92 : 0.8;
      const totalScale = Math.max(0.55, Math.min(1.48, baseScale * projected.scale));
      el.style.transform = `translate3d(${projected.x.toFixed(2)}px, ${projected.y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${totalScale.toFixed(3)})`;
      el.style.zIndex = `${Math.round(1000 - point.z)}`;
      el.style.opacity = state.systemId ? (item.id === state.systemId ? '1' : item.type === 'year' ? '0.18' : '0.1') : '1';
    });

    satelliteEntries.forEach(({ item, el }, index) => {
      const basePoint = rawSatellitePoints.get(item.id);
      if (!basePoint) return;
      const point = rotatePoint(basePoint, rotationPivot);
      const projected = project(point, width, height, camDist);
      const totalScale = Math.max(0.48, Math.min(1.12, 0.58 * projected.scale));
      satelliteProjectedPoints.set(item.id, { projected, point, basePoint });

      el.style.transform = `translate3d(${projected.x.toFixed(2)}px, ${projected.y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${totalScale.toFixed(3)})`;
      el.style.zIndex = `${Math.round(1250 - point.z)}`;
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
    let focusedPoint = null;
    let centerStrength = 1;

    if (selectedLayout) {
      focusedPoint = projectedPoints.get(focusId) || satelliteProjectedPoints.get(focusId);
      centerStrength = selectedItem?.type === 'satellite' ? 1 : state.systemId ? 0.9 : 1;
      targetZoom = selectedItem?.type === 'satellite' ? 1.2 : state.systemId ? 1.24 : 1.14;
    } else if (motionState.hoveredId) {
      targetZoom = Math.max(targetZoom, 1.02);
    }

    targetZoom *= motionState.zoom;

    if (focusedPoint) {
      targetX = (width / 2 - focusedPoint.projected.x) * centerStrength * targetZoom;
      targetY = (height / 2 - focusedPoint.projected.y) * centerStrength * targetZoom;
    }

    const cameraEase = 1 - Math.exp(-delta * 6.2);
    motionState.camX += (targetX - motionState.camX) * cameraEase;
    motionState.camY += (targetY - motionState.camY) * cameraEase;
    motionState.camZoom += (targetZoom - motionState.camZoom) * cameraEase;

    camera.style.setProperty('--cam-x', `${motionState.camX.toFixed(2)}px`);
    camera.style.setProperty('--cam-y', `${motionState.camY.toFixed(2)}px`);
    camera.style.setProperty('--cam-zoom', motionState.camZoom.toFixed(3));

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
        const satelliteId = button.getAttribute('data-satellite-id');
        const lookupId = nodeId || indexId || satelliteId;
        const item = lookupId ? detailById(lookupId) : null;
        state.status = item ? statusLabel(item) : 'Locked for now.';
        render();
        return;
      }

      const item = detailById(id);
      if (item?.type === 'year') {
        if (state.systemId === id) {
          if (!isDetailUnlocked(item)) {
            state.status = statusLabel(item);
            render();
            return;
          }
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

  document.getElementById('gallery-upload-input')?.addEventListener('change', async (event) => {
    const input = event.currentTarget;
    const note = document.getElementById('gallery-note')?.value || '';
    const contributedOn = document.getElementById('gallery-contribution-date')?.value || todayInputValue();
    await handleGalleryUpload(input.files, { note, contributedOn });
    input.value = '';
  });

  app.querySelectorAll('[data-delete-gallery-photo]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (motionState.dragMoved) return;
      const id = button.getAttribute('data-delete-gallery-photo');
      await handleGalleryDelete(id);
    });
  });

  const galleryBoard = document.getElementById('gallery-board');
  if (galleryBoard) {
    let activeDrag = null;

    const finishDrag = async () => {
      if (!activeDrag) return;
      const { id, card, boardX, boardY, baseZIndex } = activeDrag;
      card.classList.remove('is-dragging');
      card.style.zIndex = baseZIndex;
      activeDrag = null;
      await updateGalleryPhotoLayout(id, { boardX, boardY });
    };

    app.querySelectorAll('.gallery-photo-card[data-gallery-photo-id]').forEach((card, index) => {
      card.style.zIndex = `${100 + index}`;

      card.addEventListener('pointerdown', (event) => {
        if (event.target.closest('button, input, textarea, label')) return;

        const boardRect = galleryBoard.getBoundingClientRect();
        const photoId = card.getAttribute('data-gallery-photo-id');
        const photo = state.galleryPhotos.find((entry) => entry.id === photoId);
        const placement = galleryPlacement(photo, index);
        const anchorX = boardRect.left + (placement.boardX / 100) * boardRect.width;
        const anchorY = boardRect.top + (placement.boardY / 100) * boardRect.height;

        activeDrag = {
          id: photoId,
          card,
          pointerId: event.pointerId,
          baseZIndex: card.style.zIndex || `${100 + index}`,
          offsetX: event.clientX - anchorX,
          offsetY: event.clientY - anchorY,
          boardX: placement.boardX,
          boardY: placement.boardY
        };

        card.classList.add('is-dragging');
        card.style.zIndex = '999';
        card.setPointerCapture?.(event.pointerId);
        event.preventDefault();
      });

      card.addEventListener('pointermove', (event) => {
        if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
        const boardRect = galleryBoard.getBoundingClientRect();
        const nextX = ((event.clientX - boardRect.left - activeDrag.offsetX) / boardRect.width) * 100;
        const nextY = ((event.clientY - boardRect.top - activeDrag.offsetY) / boardRect.height) * 100;
        activeDrag.boardX = Math.max(10, Math.min(90, nextX));
        activeDrag.boardY = Math.max(12, Math.min(88, nextY));
        activeDrag.card.style.left = `${activeDrag.boardX}%`;
        activeDrag.card.style.top = `${activeDrag.boardY}%`;
      });

      const endPointerDrag = async (event) => {
        if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
        card.releasePointerCapture?.(event.pointerId);
        await finishDrag();
      };

      card.addEventListener('pointerup', endPointerDrag);
      card.addEventListener('pointercancel', endPointerDrag);
    });
  }

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

function performRender() {
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

function render() {
  if (!viewTransitionActive && typeof document.startViewTransition === 'function') {
    viewTransitionActive = true;
    const transition = document.startViewTransition(() => {
      performRender();
    });
    transition.finished.catch(() => {}).finally(() => {
      viewTransitionActive = false;
    });
    return;
  }

  performRender();
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
loadGalleryPhotos();
render();
