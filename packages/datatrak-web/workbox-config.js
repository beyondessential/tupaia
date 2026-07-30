module.exports = {
  globDirectory: 'dist/',
  /**
   * `.wasm` and `.data` are PGlite, the local Postgres the app reads and writes offline. Without
   * them cached the app cannot start offline at all.
   * `.br` is deliberately absent: vite-plugin-compression emits brotli siblings of the files
   * already listed here, served via Content-Encoding negotiation. Caching both would store every
   * asset twice.
   */
  globPatterns: ['**/*.{avif,data,gif,htm,html,ico,jpeg,jpg,js,json,jxl,png,svg,txt,wasm,webp}'],
  globIgnores: [
    'mockServiceWorker.js', // MSW test fixture, and a rival service worker script
    'screenshots/**', // Read by the OS install prompt, which only happens online
    'social-preview.png', // Open Graph image, only ever fetched by link crawlers
  ],
  /**
   * Vite content-hashes these filenames, so Workbox adding its own revision hash would only force
   * the precache install to re-download bytes the browser already has.
   */
  dontCacheBustURLsMatching: /-[0-9a-f]{8}\.\w+$/,
  swSrc: 'dist/sw.js',
  swDest: 'dist/sw.js',
  maximumFileSizeToCacheInBytes: 16_777_216, // 16 MiB
};
