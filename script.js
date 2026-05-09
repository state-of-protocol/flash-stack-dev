// === PWA REGISTRATION ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('SW registration failed, using blob fallback', err);
      // Fallback inline service worker (sama seperti sebelumnya)
      const swBlob = new Blob([`
        const CACHE_NAME = 'flashcards-v3';
        self.addEventListener('install', event => {
          self.skipWaiting();
        });
        self.addEventListener('activate', event => {
          event.waitUntil(clients.claim());
        });
        self.addEventListener('fetch', event => {
          const url = new URL(event.request.url);
          if (url.hostname === 'cdn.jsdelivr.net' || url.pathname === '/' || url.pathname.endsWith('.html') || url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.endsWith('.json')) {
            event.respondWith(
              caches.match(event.request).then(response => {
                return response || fetch(event.request).then(fetchResponse => {
                  if (fetchResponse.ok) {
                    const responseClone = fetchResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                  }
                  return fetchResponse;
                });
              }).catch(() => caches.match(event.request))
            );
          }
        });
      `], { type: 'application/javascript' });
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
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
      installBtn.style.display = 'none';
    });
  }
});

// === ICON DATASET & MAPPING ===
const iconList = [
  'ableton','activitypub','actix','adonis','ae','aiscript','alpinejs','anaconda','androidstudio',
  'angular','ansible','apollo','apple','appwrite','arch','arduino','astro','atom','au','autocad',
  'aws','azul','azure','babel','bash','bevy','bitbucket','blender','bootstrap','bsd','bun','c','cs',
  'cpp','crystal','cassandra','clion','clojure','cloudflare','cmake','codepen','coffeescript','css',
  'cypress','d3','dart','debian','deno','devto','discord','bots','discordjs','django','docker','dotnet',
  'dynamodb','eclipse','elasticsearch','electron','elixir','elysia','emacs','ember','emotion','express',
  'fastapi','fediverse','figma','firebase','flask','flutter','forth','fortran','gamemakerstudio','gatsby',
  'gcp','git','github','githubactions','gitlab','gmail','gherkin','go','gradle','godot','grafana','graphql',
  'gtk','gulp','haskell','haxe','haxeflixel','heroku','hibernate','html','htmx','idea','ai','instagram',
  'ipfs','java','js','jenkins','jest','jquery','kafka','kali','kotlin','ktor','kubernetes','laravel','latex',
  'less','linkedin','linux','lit','lua','md','mastodon','materialui','matlab','maven','mint','misskey',
  'mongodb','mysql','neovim','nestjs','netlify','nextjs','nginx','nim','nix','nodejs','notion','npm','nuxtjs',
  'obsidian','ocaml','octave','opencv','openshift','openstack','p5js','perl','ps','php','phpstorm','pinia',
  'pkl','plan9','planetscale','pnpm','postgres','postman','powershell','pr','prisma','processing','prometheus',
  'pug','pycharm','py','pytorch','qt','r','rabbitmq','rails','raspberrypi','react','reactivex','redhat',
  'redis','redux','regex','remix','replit','rider','robloxstudio','rocket','rollupjs','ros','ruby','rust',
  'sass','spring','sqlite','stackoverflow','styledcomponents','sublime','supabase','scala','sklearn','selenium',
  'sentry','sequelize','sketchup','solidity','solidjs','svelte','svg','swift','symfony','tailwind','tauri',
  'tensorflow','terraform','threejs','twitter','ts','ubuntu','unity','unreal','v','vala','vercel','vim',
  'visualstudio','vite','vitest','vscode','vscodium','vue','vuetify','wasm','webflow','webpack','webstorm',
  'windicss','windows','wordpress','workers','xd','yarn','yew','zig'
];

const deviconFolderMap = {
  'ae': 'aftereffects', 'ai': 'illustrator', 'au': 'audition', 'ps': 'photoshop', 'pr': 'premiere',
  'cpp': 'cplusplus', 'cs': 'csharp', 'ts': 'typescript', 'js': 'javascript', 'md': 'markdown',
  'py': 'python', 'r': 'r', 'xd': 'xd', 'bots': 'discordbots', 'discordjs': 'discordjs',
  'materialui': 'materialui', 'sklearn': 'scikitlearn', 'windicss': 'windicss',
  'nuxtjs': 'nuxtjs', 'nextjs': 'nextjs', 'nestjs': 'nestjs', 'nodejs': 'nodejs',
  'express': 'express', 'fastapi': 'fastapi', 'flask': 'flask', 'django': 'django',
  'laravel': 'laravel', 'rails': 'rails', 'symfony': 'symfony', 'vue': 'vuejs',
  'react': 'react', 'angular': 'angular', 'svelte': 'svelte', 'solidjs': 'solidjs',
  'tailwind': 'tailwindcss', 'bootstrap': 'bootstrap', 'sass': 'sass', 'less': 'less',
  'jquery': 'jquery', 'gulp': 'gulp', 'webpack': 'webpack', 'rollupjs': 'rollupjs',
  'vite': 'vite', 'vitest': 'vitest', 'jest': 'jest', 'cypress': 'cypress',
  'selenium': 'selenium', 'postman': 'postman', 'docker': 'docker', 'kubernetes': 'kubernetes',
  'terraform': 'terraform', 'ansible': 'ansible', 'jenkins': 'jenkins', 'githubactions': 'githubactions',
  'gitlab': 'gitlab', 'bitbucket': 'bitbucket', 'git': 'git', 'github': 'github',
  'aws': 'amazonwebservices', 'gcp': 'googlecloud', 'azure': 'azure', 'firebase': 'firebase',
  'heroku': 'heroku', 'netlify': 'netlify', 'vercel': 'vercel', 'cloudflare': 'cloudflare',
  'mongodb': 'mongodb', 'postgres': 'postgresql', 'mysql': 'mysql', 'sqlite': 'sqlite',
  'redis': 'redis', 'elasticsearch': 'elasticsearch', 'dynamodb': 'dynamodb',
  'graphql': 'graphql', 'apollo': 'apollo', 'prisma': 'prisma', 'sequelize': 'sequelize',
  'hibernate': 'hibernate', 'kafka': 'apachekafka', 'rabbitmq': 'rabbitmq',
  'androidstudio': 'androidstudio', 'xcode': 'xcode', 'visualstudio': 'visualstudio',
  'vscode': 'vscode', 'idea': 'intellij', 'pycharm': 'pycharm', 'webstorm': 'webstorm',
  'phpstorm': 'phpstorm', 'clion': 'clion', 'rider': 'rider', 'eclipse': 'eclipse',
  'atom': 'atom', 'sublime': 'sublime', 'emacs': 'emacs', 'vim': 'vim', 'neovim': 'neovim',
  'unity': 'unity', 'unreal': 'unrealengine', 'godot': 'godot', 'robloxstudio': 'robloxstudio',
  'blender': 'blender', 'figma': 'figma', 'sketchup': 'sketchup', 'autocad': 'autocad',
  'illustrator': 'illustrator', 'photoshop': 'photoshop', 'premierepro': 'premierepro',
  'aftereffects': 'aftereffects', 'audition': 'audition', 'xd': 'xd',
};

function getDeviconUrl(iconId) {
  const folder = deviconFolderMap[iconId] || iconId;
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${folder}/${folder}-original.svg`;
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
    iconUrl: getDeviconUrl(id),
    name: notes[id]?.name || '',
    founder: notes[id]?.founder || '',
    app: notes[id]?.app || ''
  }));
}

// UI Elements
const cardEl = document.getElementById('flashcard');
const iconImg = document.getElementById('iconImage');
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

function renderCard() {
  const card = cards[currentIndex];
  if (!card) return;
  iconImg.src = card.iconUrl;
  iconIdDisplay.textContent = card.id;
  backTitle.textContent = card.name || 'Teknologi ' + card.id;
  nameInput.value = card.name;
  founderInput.value = card.founder;
  appInput.value = card.app;
  updateProgressDots();
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
  if (!isFlipped) {
    renderCard();
  }
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
let touchStartY = 0;
cardWrapper.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

cardWrapper.addEventListener('touchend', (e) => {
  if (!touchStartX) return;
  const dx = e.changedTouches[0].screenX - touchStartX;
  const dy = e.changedTouches[0].screenY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
    if (dx < 0) nextCard();
    else prevCard();
  }
  touchStartX = 0;
});

// Keyboard navigation
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

// Auto-save on input change
[nameInput, founderInput, appInput].forEach(inp => inp.addEventListener('input', saveCurrentNote));

// Fallback icon jika image error
iconImg.addEventListener('error', function() {
  this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="4"%3E%3C/rect%3E%3Ccircle cx="12" cy="12" r="4"%3E%3C/circle%3E%3C/svg%3E';
});

// Init
buildDeck();
renderCard();
