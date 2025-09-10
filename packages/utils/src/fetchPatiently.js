import { sleep } from './sleep';

const DEFAULT_RETRIES = 20;
const DEFAULT_RETRY_PERIOD_MS = 500; // 20 x 0.5 seconds = total of 10 seconds waiting patiently

// run some function, and continue retrying the same function until its return value meets some
// criteria or we run out of time
export const fetchPatiently = async (
  fetchFn,
  validReturnTest = Boolean,
  retries = DEFAULT_RETRIES,
  retryPeriodMs = DEFAULT_RETRY_PERIOD_MS,
) => {
  const value = await fetchFn();
  if (validReturnTest(value) || retries === 0) {
    return value;
  }
  await sleep(retryPeriodMs);
  return fetchPatiently(fetchFn, validReturnTest, retries - 1, retryPeriodMs);
};
