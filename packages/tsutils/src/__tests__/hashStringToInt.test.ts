import { hashStringToInt } from '../hashStringToInt';

const MAX_INPUT_LENGTH = 1000;
const TEST_RUNS = 1000;

const randomString = () => {
  const length = Math.floor(Math.random() * MAX_INPUT_LENGTH) + 5;
  const mask =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';

  let result = '';
  for (let i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
  return result;
};

describe('hashStringToInt', () => {
  it('converts any string to an int', () => {
    let count = 0;
    while (count < TEST_RUNS) {
      const input = randomString();
      const output = hashStringToInt(input);
      expect(Number.isInteger(output)).toBe(true);
      count++;
    }
  });

  it('converts the same string to the same int', () => {
    const input = randomString();
    const output = hashStringToInt(input);

    let count = 0;
    while (count < TEST_RUNS) {
      const newOutput = hashStringToInt(input);
      expect(newOutput).toBe(output);
      count++;
    }
  });
});
