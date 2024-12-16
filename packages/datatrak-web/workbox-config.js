module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{svg,png,ico,jpg,json,js,txt,html}'],
  swSrc: 'dist/sw.js',
  swDest: 'dist/sw.js',
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB
};
