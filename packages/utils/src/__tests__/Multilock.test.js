import { Multilock } from '../Multilock';

describe('Multilock', () => {
  it('Should wait for one lock', async () => {
    const m = new Multilock();

    const unlock = m.createLock('a');

    expect(m.isLocked()).toBe(true);

    setTimeout(unlock, 10);
    await m.wait();

    expect(m.isLocked()).toBe(false);
  });

  it('Should wait for two locks', async () => {
    const m = new Multilock();

    const unlockA = m.createLock('a');
    const unlockB = m.createLock('b');

    expect(m.isLocked()).toBe(true);

    setTimeout(unlockA, 22);
    setTimeout(unlockB, 30);
    await m.wait();

    expect(m.isLocked()).toBe(false);
  });

  it('Should wait for zero locks', async () => {
    const m = new Multilock();

    expect(m.isLocked()).toBe(false);

    await m.wait();

    expect(m.isLocked()).toBe(false);
  });

  it('Should wait for two locks with the same friendly name', async () => {
    const m = new Multilock();

    const unlockA = m.createLock('a');
    const unlockB = m.createLock('a');

    expect(m.isLocked()).toBe(true);

    unlockA();

    expect(m.isLocked()).toBe(true);

    unlockB();

    expect(m.isLocked()).toBe(false);
  });

  it('Should be fine with multiple waits', async () => {
    const m = new Multilock();

    const unlock = m.createLock('a');

    const waiters = Promise.all([m.wait(), m.wait(), m.wait(), m.wait()]);

    setTimeout(unlock, 10);
    await waiters;
  });

  it('Should allow a debounce', async () => {
    const m = new Multilock();

    let val = 'before';

    // unlock 10ms from now
    const unlock = m.createLock();
    setTimeout(unlock, 10);

    // lock and unlock 20ms from now
    setTimeout(() => {
      const unlock2 = m.createLock();
      val = 'after';
      unlock2();
    }, 20);

    // start waiting for the lock *15* ms from now
    // - after the 10ms unlock has triggered
    // - before the 20ms lock/unlock has triggered
    // the debounce should still the second unlock
    const valAfterLock = await new Promise(resolve => {
      setTimeout(async () => {
        await m.waitWithDebounce(20);
        resolve(val);
      }, 15);
    });

    expect(valAfterLock).toBe('after');
  });
});
