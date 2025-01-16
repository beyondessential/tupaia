import os from 'os';
import crypto from 'crypto';

/**
 * Generate and return a mongo style ID
 * Taken from https://gist.github.com/chrisveness/7975c33ac569c124e4ceb11490576c67
 */
const LARGEST_6_DIGIT_HEX = 0xffffff;
let currentCounterValue = 0;
export const generateId = () => {
  const seconds = getSecondsStringFromTimestamp(new Date());
  const machineId = crypto.createHash('md5').update(os.hostname()).digest('hex').slice(0, 6);
  const processId = process.pid.toString(16).slice(0, 4).padStart(4, '0');

  // generation of the counter differs from the original gist to reduce the chance of conflicts
  currentCounterValue = (currentCounterValue + 1) % LARGEST_6_DIGIT_HEX;
  const counter = currentCounterValue.toString(16).slice(0, 6).padStart(6, '0');

  return seconds + machineId + processId + counter;
};

export const getHighestPossibleIdForGivenTime = timestamp =>
  getSecondsStringFromTimestamp(timestamp).padEnd(24, 'f');

const getSecondsStringFromTimestamp = timestamp =>
  Math.floor(timestamp / 1000)
    .toString(16)
    .padStart(8, '0');
