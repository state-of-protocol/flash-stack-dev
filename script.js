// === PWA REGISTRATION ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('SW gagal, guna blob', err);
      const swBlob = new Blob([`
        const CACHE_NAME = 'flashcards-v4';
        self.addEventListener('install', e => { self.skipWaiting(); });
        self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });
        self.addEventListener('fetch', e => {
          const url = new URL(e.request.url);
          if (url.hostname === 'cdn.jsdelivr.net' || url.pathname === '/' || url.pathname.match(/\.(html|css|js|json)$/)) {
            e.respondWith(
              caches.match(e.request).then(r => r || fetch(e.request).then(fr => {
                if(fr.ok){ const cl = fr.clone(); caches.open(CACHE_NAME).then(c => c.put(e.request, cl)); }
                return fr;
              }).catch(() => caches.match(e.request)))
            );
          }
        });
      `], {type:'application/javascript'});
      navigator.serviceWorker.register(URL.createObjectURL(swBlob));
    });
  });
}

// === INSTALL PROMPT ===
let deferredPrompt;
const installBtn = document.getElementById('installButton');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';
});
installBtn.addEventListener('click', () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => { deferredPrompt = null; installBtn.style.display = 'none'; });
  }
});

// === FUNGSI BINA URL IKON (bergantung pada iconList, iconMeta dari icons.js) ===
const BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

function buildIconUrl(id) {
  const meta = iconMeta[id] || {};
  const folder = meta.folder || id;
  const variant = meta.variant || 'original';
  return `${BASE}/${folder}/${folder}-${variant}.svg`;
}

// Pra-muat ikon berikutnya secara latar belakang
const preloaded = new Set();
function preloadIcon(id) {
  if (preloaded.has(id)) return;
  preloaded.add(id);
  const url = buildIconUrl(id);
  const img = new Image();
  img.src = url;
}

function preloadNeighbors(currentIdx) {
  for (let i = currentIdx - 2; i <= currentIdx + 2; i++) {
    if (i >= 0 && i < iconList.length) preloadIcon(iconList[i]);
  }
}

// === APPLICATION STATE ===
const STORAGE_KEY = 'flashcards_notes';
let cards = [];
let currentIndex = 0;
let isFlipped = false;

function loadNotes() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : {};
}

function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function buildDeck() {
  const notes = loadNotes();
  cards = iconList.map(id => ({
    id,
    iconUrl: buildIconUrl(id),
    name: notes[id]?.name || '',
    founder: notes[id]?.founder || '',
    app: notes[id]?.app || ''
  }));
}

// UI Elements
const cardEl = document.getElementById('flashcard');
const iconImg = document.getElementById('iconImage');
const iconContainer = document.getElementById('iconContainer');
const iconIdDisplay = document.getElementById('iconIdDisplay');
const backTitle = document.getElementById('backTitle');
const nameInput = document.getElementById('nameInput');
const founderInput = document.getElementById('founderInput');
const appInput = document.getElementById('appInput');
const progressDots = document.getElementById('progressDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const flipBtn = document.getElementById('flipBtn');
const cardWrapper = document.getElementById('cardWrapper');

let currentLoadedUrl = '';

function setIconSrc(url) {
  if (url === currentLoadedUrl) return;
  iconImg.style.opacity = '0';
  iconContainer.classList.add('loading');
  iconImg.src = url;
  currentLoadedUrl = url;
}

iconImg.addEventListener('load', () => {
  iconImg.style.opacity = '1';
  iconContainer.classList.remove('loading');
});
iconImg.addEventListener('error', () => {
  iconImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="4"%3E%3C/rect%3E%3Ccircle cx="12" cy="12" r="4"%3E%3C/circle%3E%3C/svg%3E';
  iconImg.style.opacity = '1';
  iconContainer.classList.remove('loading');
});

function renderCard() {
  const card = cards[currentIndex];
  if (!card) return;
  setIconSrc(card.iconUrl);
  iconIdDisplay.textContent = card.id;
  backTitle.textContent = card.name || 'Teknologi ' + card.id;
  nameInput.value = card.name;
  founderInput.value = card.founder;
  appInput.value = card.app;
  updateProgressDots();
  preloadNeighbors(currentIndex);
}

function updateProgressDots() {
  progressDots.innerHTML = '';
  cards.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (idx === currentIndex ? ' active' : '');
    dot.addEventListener('click', () => navigateTo(idx));
    progressDots.appendChild(dot);
  });
}

function flipCard() {
  isFlipped = !isFlipped;
  cardEl.classList.toggle('flipped', isFlipped);
  saveCurrentNote();
  if (!isFlipped) renderCard();
}

function saveCurrentNote() {
  const card = cards[currentIndex];
  card.name = nameInput.value.trim();
  card.founder = founderInput.value.trim();
  card.app = appInput.value.trim();
  const allNotes = loadNotes();
  allNotes[card.id] = { name: card.name, founder: card.founder, app: card.app };
  saveNotes(allNotes);
  backTitle.textContent = card.name || 'Teknologi ' + card.id;
}

function navigateTo(index) {
  if (index < 0 || index >= cards.length) return;
  saveCurrentNote();
  currentIndex = index;
  if (isFlipped) {
    isFlipped = false;
    cardEl.classList.remove('flipped');
  }
  renderCard();
}

function nextCard() { navigateTo(currentIndex + 1); }
function prevCard() { navigateTo(currentIndex - 1); }

// Swipe detection
let touchStartX = 0;
cardWrapper.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

cardWrapper.addEventListener('touchend', (e) => {
  if (!touchStartX) return;
  const dx = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(dx) > 50) {
    if (dx < 0) nextCard();
    else prevCard();
  }
  touchStartX = 0;
});

// Keyboard
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') prevCard();
  else if (e.key === 'ArrowRight') nextCard();
  else if (e.key === ' ' || e.key === 'Space') { e.preventDefault(); flipCard(); }
});

// Buttons
prevBtn.addEventListener('click', prevCard);
nextBtn.addEventListener('click', nextCard);
flipBtn.addEventListener('click', flipCard);
cardEl.addEventListener('click', (e) => {
  if (e.target.tagName === 'INPUT') return;
  flipCard();
});

// Auto-save
[nameInput, founderInput, appInput].forEach(inp => inp.addEventListener('input', saveCurrentNote));

// Init
buildDeck();
renderCard();
preloadNeighbors(0);
