const ENV_VAR = 'ANALYTICS_QUERY_CONCURRENCY';

const loadLimitQueryConcurrency = (envValue: string | undefined) => {
  if (envValue === undefined) {
    delete process.env[ENV_VAR];
  } else {
    process.env[ENV_VAR] = envValue;
  }
  let limitQueryConcurrency!: typeof import('../limitQueryConcurrency').limitQueryConcurrency;
  jest.isolateModules(() => {
    ({ limitQueryConcurrency } = require('../limitQueryConcurrency'));
  });
  return limitQueryConcurrency;
};

const createDeferredTasks = (count: number) => {
  let inFlight = 0;
  let maxInFlight = 0;
  const resolvers: (() => void)[] = [];
  const tasks = Array.from({ length: count }, (_, index) => () => {
    inFlight++;
    maxInFlight = Math.max(maxInFlight, inFlight);
    return new Promise<number>(resolve => {
      resolvers.push(() => {
        inFlight--;
        resolve(index);
      });
    });
  });
  const settleAll = async () => {
    while (resolvers.length > 0) {
      resolvers.shift()!();
      await new Promise(resolve => setImmediate(resolve));
    }
  };
  return { tasks, settleAll, getMaxInFlight: () => maxInFlight };
};

describe('limitQueryConcurrency', () => {
  const originalValue = process.env[ENV_VAR];
  afterAll(() => {
    if (originalValue === undefined) delete process.env[ENV_VAR];
    else process.env[ENV_VAR] = originalValue;
  });

  it('runs every query at once when the env var is unset', async () => {
    const limitQueryConcurrency = loadLimitQueryConcurrency(undefined);
    const { tasks, settleAll, getMaxInFlight } = createDeferredTasks(10);

    const results = Promise.all(tasks.map(task => limitQueryConcurrency(task)));
    await settleAll();

    expect(await results).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(getMaxInFlight()).toBe(10);
  });

  it('caps in-flight queries across separate callers', async () => {
    const limitQueryConcurrency = loadLimitQueryConcurrency('3');
    const { tasks, settleAll, getMaxInFlight } = createDeferredTasks(10);

    // Two independent batches, as two concurrent report requests would issue
    const firstBatch = Promise.all(tasks.slice(0, 5).map(task => limitQueryConcurrency(task)));
    const secondBatch = Promise.all(tasks.slice(5).map(task => limitQueryConcurrency(task)));
    await new Promise(resolve => setImmediate(resolve));
    expect(getMaxInFlight()).toBe(3);
    await settleAll();

    expect(await firstBatch).toEqual([0, 1, 2, 3, 4]);
    expect(await secondBatch).toEqual([5, 6, 7, 8, 9]);
    expect(getMaxInFlight()).toBe(3);
  });

  it('frees the slot when a query fails', async () => {
    const limitQueryConcurrency = loadLimitQueryConcurrency('1');

    await expect(
      limitQueryConcurrency(() => Promise.reject(new Error('query failed'))),
    ).rejects.toThrow('query failed');
    await expect(limitQueryConcurrency(() => Promise.resolve('next'))).resolves.toBe('next');
  });

  it.each(['0', '-2', '1.5', 'six'])('rejects an invalid value of "%s"', async value => {
    const limitQueryConcurrency = loadLimitQueryConcurrency(value);

    expect(() => limitQueryConcurrency(() => Promise.resolve())).toThrow(
      'ANALYTICS_QUERY_CONCURRENCY must be a positive integer',
    );
  });
});
