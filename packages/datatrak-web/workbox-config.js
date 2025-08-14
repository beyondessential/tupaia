module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{avif,gif,htm,html,ico,jpeg,jpg,js,json,jxl,png,svg,txt,webp}'],
  swSrc: 'dist/sw.js',
  swDest: 'dist/sw.js',
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB
};
