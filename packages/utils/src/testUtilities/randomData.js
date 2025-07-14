import Chance from 'chance';

const chance = new Chance();

export function randomEmail() {
  return chance.email({ domain: 'tupaia.org' });
}

export function randomString() {
  return chance.string({ length: 7 });
}

export function randomIntBetween(min, max) {
  return chance.integer({ min, max });
}
