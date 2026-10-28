import { EventEmitter } from 'events';

import type { DatatrakDatabase } from '../../database/DatatrakDatabase';
import { ConnectionWatcher } from '../../sync/ConnectionWatcher';

// The built `sleep` holds on to core-js’s `setTimeout`, which fake timers can’t replace
jest.mock('@tupaia/utils', () => ({
  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
}));

const createWatcher = () => {
  const pool = new EventEmitter();
  let giveConnection = () => {};
  const client = {
    pool,
    // Resolves when the test gives the connection
    acquireConnection: jest.fn(
      () =>
        new Promise<string>(resolve => {
          giveConnection = () => resolve('connection');
        }),
    ),
  };
  const database = { connection: { client } } as unknown as DatatrakDatabase;
  const watcher = new ConnectionWatcher(database);
  const askForConnection = () => client.acquireConnection() as Promise<string>;
  return { pool, watcher, askForConnection, giveConnection: () => giveConnection() };
};

describe('ConnectionWatcher', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('counts queries waiting for the connection', async () => {
    const { watcher, askForConnection, giveConnection } = createWatcher();

    const query = askForConnection();
    expect(watcher.waitingCount).toBe(1);

    giveConnection();
    await query;
    expect(watcher.waitingCount).toBe(0);
  });

  it('waits until the connection has been unused for the idle time', async () => {
    const { pool, watcher } = createWatcher();
    pool.emit('release');

    let isIdle = false;
    const waiting = watcher.waitUntilIdle(3000).then(() => {
      isIdle = true;
    });

    await jest.advanceTimersByTimeAsync(2000);
    pool.emit('release'); // The app used the database again

    await jest.advanceTimersByTimeAsync(2000);
    expect(isIdle).toBe(false);

    await jest.advanceTimersByTimeAsync(1000);
    await waiting;
    expect(isIdle).toBe(true);
  });

  it('stops waiting at the deadline if the connection is still in use', async () => {
    const { pool, watcher } = createWatcher();
    pool.emit('release');
    const deadline = Date.now() + 5000;

    let result: boolean | undefined;
    const waiting = watcher.waitUntilIdle(3000, deadline).then(isIdle => {
      result = isIdle;
    });

    // The app keeps using the database every 2 seconds, so it is never idle for 3
    for (let i = 0; i < 4; i++) {
      pool.emit('release');
      await jest.advanceTimersByTimeAsync(2000);
    }
    await waiting;
    expect(result).toBe(false);
  });
});
