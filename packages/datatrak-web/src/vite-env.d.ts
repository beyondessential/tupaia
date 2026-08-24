/// <reference types="vite/client" />

// 'pglite-dist' is a Vite alias (see vite.config.js) to @electric-sql/pglite's dist directory,
// used to import its wasm/data assets as hashed URLs — see database/pglite.worker.ts
declare module 'pglite-dist/pglite.wasm?url' {
  const url: string;
  export default url;
}

declare module 'pglite-dist/pglite.data?url' {
  const url: string;
  export default url;
}

declare module 'pglite-dist/initdb.wasm?url' {
  const url: string;
  export default url;
}
