// Prayer Journal — Service Worker
// Strategy:
//   • HTML / navigation requests → network-first (so updates ship), fallback to cache.
//   • Other static assets → cache-first.
// Bump CACHE_NAME whenever you want all clients to refresh their cached app shell.

const CACHE_NAME = 'prayer-journal-v3';
const BIBLE_BOOKS = [
  'Bible_01_Genesis','Bible_02_Exodus','Bible_03_Leviticus','Bible_04_Numbers','Bible_05_Deuteronomy',
  'Bible_06_Joshua','Bible_07_Judges','Bible_08_Ruth','Bible_09_I_Samuel','Bible_10_II_Samuel',
  'Bible_11_I_Kings','Bible_12_II_Kings','Bible_13_I_Chronicles','Bible_14_II_Chronicles','Bible_15_Ezra',
  'Bible_16_Nehemiah','Bible_17_Esther','Bible_18_Job','Bible_19_Psalms','Bible_20_Proverbs',
  'Bible_21_Ecclesiastes','Bible_22_Song_of_Solomon','Bible_23_Isaiah','Bible_24_Jeremiah','Bible_25_Lamentations',
  'Bible_26_Ezekiel','Bible_27_Daniel','Bible_28_Hosea','Bible_29_Joel','Bible_30_Amos',
  'Bible_31_Obadiah','Bible_32_Jonah','Bible_33_Micah','Bible_34_Nahum','Bible_35_Habakkuk',
  'Bible_36_Zephaniah','Bible_37_Haggai','Bible_38_Zechariah','Bible_39_Malachi','Bible_40_Matthew',
  'Bible_41_Mark','Bible_42_Luke','Bible_43_John','Bible_44_Acts','Bible_45_Romans',
  'Bible_46_I_Corinthians','Bible_47_II_Corinthians','Bible_48_Galatians','Bible_49_Ephesians','Bible_50_Philippians',
  'Bible_51_Colossians','Bible_52_I_Thessalonians','Bible_53_II_Thessalonians','Bible_54_I_Timothy','Bible_55_II_Timothy',
  'Bible_56_Titus','Bible_57_Philemon','Bible_58_Hebrews','Bible_59_James','Bible_60_I_Peter',
  'Bible_61_II_Peter','Bible_62_I_John','Bible_63_II_John','Bible_64_III_John','Bible_65_Jude',
  'Bible_66_Revelation_of_John'
].map(b => './bible/' + b + '.md');
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-maskable.svg',
  ...BIBLE_BOOKS
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  // Do NOT skipWaiting here — a new SW parks in the "waiting" state so the page
  // can surface a "new version — tap to update" toast. The page posts
  // SKIP_WAITING (below) when the user opts in.
});

// The page asks us to take over immediately once the user taps "update".
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Only handle same-origin requests; let the browser deal with anything else
  if (url.origin !== self.location.origin) return;

  // HTML / navigation → network-first
  if (req.mode === 'navigate' || req.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req).then(c => c || caches.match('./index.html')))
    );
    return;
  }

  // Everything else → cache-first
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return res;
      }).catch(() => new Response('Offline — and this resource is not cached.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      }));
    })
  );
});
