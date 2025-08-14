export const hash = () => {
  throw new Error('@node-rs/argon2 not available in browser environment');
};

export const verify = () => {
  throw new Error('@node-rs/argon2 not available in browser environment');
};

// Export any other functions your code imports
export default {
  hash,
  verify,
};
