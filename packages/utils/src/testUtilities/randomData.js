export function randomEmail() {
  return `${Math.random().toString(36).substring(7)}@tupaia.org`;
}

export function randomString() {
  return `string${Math.random().toString(36).substring(7)}`;
}

export function randomIntBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
