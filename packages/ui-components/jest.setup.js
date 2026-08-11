/** jsdom does not implement Web Crypto API; borrow Node’s implementation. */
const crypto = require('node:crypto');
Object.defineProperty(globalThis, 'crypto', {
  value: crypto.webcrypto,
  configurable: true,
  writable: true,
});
