import { CHAPTERS, REDEEM_CODES, STORAGE_KEY } from './data.js';

const app = document.getElementById('app');
const chapterByKey = new Map(CHAPTERS.map((chapter) => [chapter.key, chapter]));

function loadStoredUnlocks() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) {
      return new Set();
    }

    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(parsed.filter((key) => chapterByKey.has(String(key))));
  } catch {
    return new Set();
  }
}

function saveUnlocks(unlockSet) {
  const sorted = Array.from(unlockSet).sort((left, right) => Number(left) - Number(right));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
}

function getDateUnlocks(now = new Date()) {
  const unlocks = new Set();

  CHAPTERS.forEach((chapter) => {
    const unlockDate = new Date(chapter.year, 2, 9, 0, 0, 0, 0);
    if (now >= unlockDate) {
      unlocks.add(chapter.key);
    }
  });

  return unlocks;
}

function mergeUnlockSets(...sets) {
  const merged = new Set();
  sets.forEach((set) => {
    set.forEach((key) => merged.add(key));
  });
  return merged;
}

let unlockedChapters = mergeUnlockSets(loadStoredUnlocks(), getDateUnlocks());
saveUnlocks(unlockedChapters);

function unlockDateLabel(year) {
  return `Unlocks March 9, ${year}`;
}

function isUnlocked(chapterKey) {
  return unlockedChapters.has(chapterKey);
}

function chapterQueryKey() {
  const params = new URLSearchParams(window.location.search);
  return params.get('key');
}

function clearChapterQuery() {
  const next = `${window.location.pathname}${window.location.hash}`;
  window.history.pushState({}, '', next);
}

function chapterCard(chapter) {
  const unlocked = isUnlocked(chapter.key);

  if (!unlocked) {
    return `
      <article class="card locked">
        <div>
          <p class="year">${chapter.year}</p>
          <h3>${chapter.title}</h3>
          <p>${unlockDateLabel(chapter.year)}</p>
        </div>
        <span class="badge">Locked</span>
      </article>
    `;
  }

  return `
    <article class="card">
      <div>
        <p class="year">${chapter.year}</p>
        <h3>${chapter.title}</h3>
        <p>${chapter.summary}</p>
      </div>
      <a class="button-link" href="?key=${encodeURIComponent(chapter.key)}">Open chapter</a>
    </article>
  `;
}

function underConstructionCard() {
  return `
    <article class="card under-construction">
      <div>
        <p class="year">Next capsule</p>
        <h3>Under construction</h3>
        <p>Still being prepared. Some pieces are not in place yet.</p>
      </div>
      <div class="construction-visual" aria-hidden="true">
        <span>⚠</span>
        <span>◢◤</span>
        <span>⚒</span>
      </div>
    </article>
  `;
}

function vaultCardsMarkup() {
  const cards = [];

  CHAPTERS.forEach((chapter) => {
    cards.push(chapterCard(chapter));

    if (chapter.key === '2026') {
      cards.push(underConstructionCard());
    }
  });

  return cards.join('');
}

function renderRedeem(statusMessage = '') {
  return `
    <section class="code-stage" aria-label="Redeem area" style="--mx-light: 0px; --mx-card: 0px; --my-card: 0px; --glow-shift: 0px;">
      <div class="hanging-light" aria-hidden="true">
        <span class="light-cord"></span>
        <span class="light-head"></span>
      </div>
      <section class="redeem card spotlight">
        <h2>Redeem a code</h2>
        <form id="redeem-form" autocomplete="off">
          <label for="redeem-code">Enter code</label>
          <div class="redeem-row">
            <input id="redeem-code" name="code" placeholder="CODE-STARLIGHT" maxlength="64" required />
            <button type="submit">Redeem</button>
          </div>
        </form>
        <p class="status" role="status">${statusMessage}</p>
      </section>
      <p class="scroll-hint">Scroll to see the capsules.</p>
    </section>
  `;
}

function enableCodeStageMotion() {
  return;
}

function chapterContent(chapter) {
  const art = chapter.art
    ? `<img src="${chapter.art}" alt="A memory marker for ${chapter.year}" class="chapter-art" />`
    : '';

  const body = Array.isArray(chapter.content)
    ? chapter.content.map((paragraph) => `<p>${paragraph}</p>`).join('')
    : '<p>This chapter has opened, but its pages are still waiting to be written.</p>';

  return `
    <article class="card chapter-view">
      <p class="year">${chapter.year}</p>
      <h2>${chapter.title}</h2>
      ${art}
      ${body}
      <button id="back-to-vault" class="ghost" type="button">Back to vault</button>
    </article>
  `;
}

function render(statusMessage = '') {
  const selectedKey = chapterQueryKey();

  if (selectedKey && chapterByKey.has(selectedKey) && isUnlocked(selectedKey)) {
    const chapter = chapterByKey.get(selectedKey);
    app.innerHTML = `${chapterContent(chapter)}${renderRedeem(statusMessage)}`;

    const backButton = document.getElementById('back-to-vault');
    backButton?.addEventListener('click', () => {
      clearChapterQuery();
      render(statusMessage);
    });

    bindRedeemForm();
    enableCodeStageMotion();
    return;
  }

  app.innerHTML = `
    ${renderRedeem(statusMessage)}
    <section class="capsule-section">
      <h2>Capsules</h2>
      <section class="vault-grid">
        ${vaultCardsMarkup()}
      </section>
    </section>
  `;

  bindRedeemForm();
  enableCodeStageMotion();
}

function normalizeCode(raw) {
  return raw.trim().toUpperCase();
}

function bindRedeemForm() {
  const form = document.getElementById('redeem-form');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const codeInput = document.getElementById('redeem-code');
    const code = normalizeCode(codeInput.value);
    const chapterKeys = REDEEM_CODES[code];

    if (!chapterKeys) {
      render('Code not recognized.');
      return;
    }

    const nextUnlocks = new Set(unlockedChapters);
    chapterKeys.forEach((chapterKey) => {
      if (chapterByKey.has(chapterKey)) {
        nextUnlocks.add(chapterKey);
      }
    });

    const changed = nextUnlocks.size !== unlockedChapters.size;
    unlockedChapters = mergeUnlockSets(nextUnlocks, getDateUnlocks());
    saveUnlocks(unlockedChapters);

    render(changed ? 'Code redeemed. A chapter opened.' : 'Code already redeemed. Nothing new to unlock.');
  });
}

window.addEventListener('popstate', () => render());

render();
