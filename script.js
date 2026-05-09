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

// === ICON DATASET & MAPPING DENGAN VARIAN ===
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

// Pemetaan folder dan varian untuk setiap ID (hanya yang berbeza dari default)
const iconMeta = {
  ae: { folder: 'aftereffects' },
  ai: { folder: 'illustrator' },
  au: { folder: 'audition' },
  ps: { folder: 'photoshop' },
  pr: { folder: 'premiere' },
  cpp: { folder: 'cplusplus' },
  cs: { folder: 'csharp' },
  ts: { folder: 'typescript' },
  js: { folder: 'javascript' },
  md: { folder: 'markdown' },
  py: { folder: 'python' },
  r: { folder: 'r' },
  xd: { folder: 'xd', variant: 'plain' },
  bots: { folder: 'discordbots' },
  discordjs: { folder: 'discordjs' },
  materialui: { folder: 'materialui' },
  sklearn: { folder: 'scikitlearn' },
  windicss: { folder: 'windicss' },
  nuxtjs: { folder: 'nuxtjs' },
  nextjs: { folder: 'nextjs' },
  nestjs: { folder: 'nestjs' },
  nodejs: { folder: 'nodejs' },
  express: { folder: 'express' },
  fastapi: { folder: 'fastapi' },
  flask: { folder: 'flask' },
  django: { folder: 'django' },
  laravel: { folder: 'laravel' },
  rails: { folder: 'rails' },
  symfony: { folder: 'symfony' },
  vue: { folder: 'vuejs' },
  react: { folder: 'react' },
  angular: { folder: 'angular' },
  svelte: { folder: 'svelte' },
  solidjs: { folder: 'solidjs' },
  tailwind: { folder: 'tailwindcss' },
  bootstrap: { folder: 'bootstrap' },
  sass: { folder: 'sass' },
  less: { folder: 'less' },
  jquery: { folder: 'jquery' },
  gulp: { folder: 'gulp' },
  webpack: { folder: 'webpack' },
  rollupjs: { folder: 'rollupjs' },
  vite: { folder: 'vite' },
  vitest: { folder: 'vitest' },
  jest: { folder: 'jest' },
  cypress: { folder: 'cypress' },
  selenium: { folder: 'selenium' },
  postman: { folder: 'postman' },
  docker: { folder: 'docker' },
  kubernetes: { folder: 'kubernetes' },
  terraform: { folder: 'terraform' },
  ansible: { folder: 'ansible' },
  jenkins: { folder: 'jenkins' },
  githubactions: { folder: 'githubactions' },
  gitlab: { folder: 'gitlab' },
  bitbucket: { folder: 'bitbucket' },
  git: { folder: 'git' },
  github: { folder: 'github' },
  aws: { folder: 'amazonwebservices' },
  gcp: { folder: 'googlecloud' },
  azure: { folder: 'azure' },
  firebase: { folder: 'firebase' },
  heroku: { folder: 'heroku' },
  netlify: { folder: 'netlify' },
  vercel: { folder: 'vercel' },
  cloudflare: { folder: 'cloudflare' },
  mongodb: { folder: 'mongodb' },
  postgres: { folder: 'postgresql' },
  mysql: { folder: 'mysql' },
  sqlite: { folder: 'sqlite' },
  redis: { folder: 'redis' },
  elasticsearch: { folder: 'elasticsearch' },
  dynamodb: { folder: 'dynamodb' },
  graphql: { folder: 'graphql' },
  apollo: { folder: 'apollo' },
  prisma: { folder: 'prisma' },
  sequelize: { folder: 'sequelize' },
  hibernate: { folder: 'hibernate' },
  kafka: { folder: 'apachekafka' },
  rabbitmq: { folder: 'rabbitmq' },
  androidstudio: { folder: 'androidstudio' },
  visualstudio: { folder: 'visualstudio' },
  vscode: { folder: 'vscode' },
  idea: { folder: 'intellij' },
  pycharm: { folder: 'pycharm' },
  webstorm: { folder: 'webstorm' },
  phpstorm: { folder: 'phpstorm' },
  clion: { folder: 'clion' },
  rider: { folder: 'rider' },
  eclipse: { folder: 'eclipse' },
  atom: { folder: 'atom' },
  sublime: { folder: 'sublime' },
  emacs: { folder: 'emacs' },
  vim: { folder: 'vim' },
  neovim: { folder: 'neovim' },
  unity: { folder: 'unity' },
  unreal: { folder: 'unrealengine' },
  godot: { folder: 'godot' },
  robloxstudio: { folder: 'robloxstudio' },
  blender: { folder: 'blender' },
  figma: { folder: 'figma' },
  sketchup: { folder: 'sketchup' },
  autocad: { folder: 'autocad' },
  illustrator: { folder: 'illustrator' },
  photoshop: { folder: 'photoshop' },
  premierepro: { folder: 'premierepro' },
  aftereffects: { folder: 'aftereffects' },
  audition: { folder: 'audition' },
  // Tambahan spesifik varian plain
  activitypub: { folder: 'activitypub', variant: 'plain' },
  actix: { folder: 'actix', variant: 'plain' },
  adonis: { folder: 'adonis', variant: 'plain' },
  alpinejs: { folder: 'alpinejs', variant: 'plain' },
  anaconda: { folder: 'anaconda', variant: 'plain' },
  appwrite: { folder: 'appwrite', variant: 'plain' },
  arch: { folder: 'arch', variant: 'plain' },
  arduino: { folder: 'arduino', variant: 'plain' },
  astro: { folder: 'astro', variant: 'plain' },
  azul: { folder: 'azul', variant: 'plain' },
  babel: { folder: 'babel', variant: 'plain' },
  bevy: { folder: 'bevy', variant: 'plain' },
  bsd: { folder: 'bsd', variant: 'plain' },
  bun: { folder: 'bun', variant: 'plain' },
  crystal: { folder: 'crystal', variant: 'plain' },
  cassandra: { folder: 'cassandra', variant: 'plain' },
  clojure: { folder: 'clojure', variant: 'plain' },
  cmake: { folder: 'cmake', variant: 'plain' },
  codepen: { folder: 'codepen', variant: 'plain' },
  coffeescript: { folder: 'coffeescript', variant: 'plain' },
  debian: { folder: 'debian', variant: 'plain' },
  deno: { folder: 'deno', variant: 'plain' },
  devto: { folder: 'devto', variant: 'plain' },
  discord: { folder: 'discord', variant: 'plain' },
  elixir: { folder: 'elixir', variant: 'plain' },
  elysia: { folder: 'elysia', variant: 'plain' },
  ember: { folder: 'ember', variant: 'plain' },
  emotion: { folder: 'emotion', variant: 'plain' },
  fediverse: { folder: 'fediverse', variant: 'plain' },
  flutter: { folder: 'flutter', variant: 'plain' },
  forth: { folder: 'forth', variant: 'plain' },
  fortran: { folder: 'fortran', variant: 'plain' },
  gamemakerstudio: { folder: 'gamemakerstudio', variant: 'plain' },
  gatsby: { folder: 'gatsby', variant: 'plain' },
  gherkin: { folder: 'gherkin', variant: 'plain' },
  go: { folder: 'go', variant: 'plain' },
  gradle: { folder: 'gradle', variant: 'plain' },
  grafana: { folder: 'grafana', variant: 'plain' },
  gtk: { folder: 'gtk', variant: 'plain' },
  haskell: { folder: 'haskell', variant: 'plain' },
  haxe: { folder: 'haxe', variant: 'plain' },
  haxeflixel: { folder: 'haxeflixel', variant: 'plain' },
  htmx: { folder: 'htmx', variant: 'plain' },
  ipfs: { folder: 'ipfs', variant: 'plain' },
  java: { folder: 'java', variant: 'plain' },
  kali: { folder: 'kali', variant: 'plain' },
  kotlin: { folder: 'kotlin', variant: 'plain' },
  ktor: { folder: 'ktor', variant: 'plain' },
  latex: { folder: 'latex', variant: 'plain' },
  linkedin: { folder: 'linkedin', variant: 'plain' },
  lit: { folder: 'lit', variant: 'plain' },
  lua: { folder: 'lua', variant: 'plain' },
  mastodon: { folder: 'mastodon', variant: 'plain' },
  matlab: { folder: 'matlab', variant: 'plain' },
  maven: { folder: 'maven', variant: 'plain' },
  mint: { folder: 'mint', variant: 'plain' },
  misskey: { folder: 'misskey', variant: 'plain' },
  nim: { folder: 'nim', variant: 'plain' },
  nix: { folder: 'nix', variant: 'plain' },
  notion: { folder: 'notion', variant: 'plain' },
  npm: { folder: 'npm', variant: 'plain' },
  obsidian: { folder: 'obsidian', variant: 'plain' },
  ocaml: { folder: 'ocaml', variant: 'plain' },
  octave: { folder: 'octave', variant: 'plain' },
  opencv: { folder: 'opencv', variant: 'plain' },
  openshift: { folder: 'openshift', variant: 'plain' },
  openstack: { folder: 'openstack', variant: 'plain' },
  p5js: { folder: 'p5js', variant: 'plain' },
  perl: { folder: 'perl', variant: 'plain' },
  php: { folder: 'php', variant: 'plain' },
  pinia: { folder: 'pinia', variant: 'plain' },
  pkl: { folder: 'pkl', variant: 'plain' },
  plan9: { folder: 'plan9', variant: 'plain' },
  planetscale: { folder: 'planetscale', variant: 'plain' },
  pnpm: { folder: 'pnpm', variant: 'plain' },
  powershell: { folder: 'powershell', variant: 'plain' },
  processing: { folder: 'processing', variant: 'plain' },
  prometheus: { folder: 'prometheus', variant: 'plain' },
  pug: { folder: 'pug', variant: 'plain' },
  pytorch: { folder: 'pytorch', variant: 'plain' },
  qt: { folder: 'qt', variant: 'plain' },
  reactivex: { folder: 'reactivex', variant: 'plain' },
  redhat: { folder: 'redhat', variant: 'plain' },
  redux: { folder: 'redux', variant: 'plain' },
  regex: { folder: 'regex', variant: 'plain' },
  remix: { folder: 'remix', variant: 'plain' },
  replit: { folder: 'replit', variant: 'plain' },
  rocket: { folder: 'rocket', variant: 'plain' },
  ros: { folder: 'ros', variant: 'plain' },
  ruby: { folder: 'ruby', variant: 'plain' },
  rust: { folder: 'rust', variant: 'plain' },
  spring: { folder: 'spring', variant: 'plain' },
  stackoverflow: { folder: 'stackoverflow', variant: 'plain' },
  styledcomponents: { folder: 'styledcomponents', variant: 'plain' },
  supabase: { folder: 'supabase', variant: 'plain' },
  scala: { folder: 'scala', variant: 'plain' },
  sentry: { folder: 'sentry', variant: 'plain' },
  solidity: { folder: 'solidity', variant: 'plain' },
  svg: { folder: 'svg', variant: 'plain' },
  swift: { folder: 'swift', variant: 'plain' },
  tauri: { folder: 'tauri', variant: 'plain' },
  tensorflow: { folder: 'tensorflow', variant: 'plain' },
  threejs: { folder: 'threejs', variant: 'plain' },
  twitter: { folder: 'twitter', variant: 'plain' },
  ubuntu: { folder: 'ubuntu', variant: 'plain' },
  v: { folder: 'v', variant: 'plain' },
  vala: { folder: 'vala', variant: 'plain' },
  vuetify: { folder: 'vuetify', variant: 'plain' },
  wasm: { folder: 'wasm', variant: 'plain' },
  webflow: { folder: 'webflow', variant: 'plain' },
  windows: { folder: 'windows', variant: 'plain' },
  wordpress: { folder: 'wordpress', variant: 'plain' },
  workers: { folder: 'workers', variant: 'plain' },
  yarn: { folder: 'yarn', variant: 'plain' },
  yew: { folder: 'yew', variant: 'plain' },
  zig: { folder: 'zig', variant: 'plain' },
  // Selebihnya guna default original
};

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
  // Reset ke loading
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
  // Guna placeholder jika gagal
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
