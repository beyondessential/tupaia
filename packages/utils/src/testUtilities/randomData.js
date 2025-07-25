import Chance from 'chance';

const chance = new Chance();

export function randomEmail() {
  return chance.email({ domain: 'tupaia.org' });
}

export function randomString(length = 10) {
  return chance.string({ length });
}

export function randomIntBetween(min, max) {
  return chance.integer({ min, max });
}
