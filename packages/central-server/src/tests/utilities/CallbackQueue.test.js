/* eslint-disable no-return-assign */

import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { CallbackQueue } from '../../utilities/CallbackQueue';

describe('Callback queue', () => {
  it('Should queue one callback', async () => {
    const cbq = new CallbackQueue();
    let amt = 0;

    cbq.add(() => (amt = 1), 'set');

    await cbq.waitUntilFinished();
    expect(amt).to.equal(1);
  });

  it('Should queue multiple callbacks', async () => {
    const cbq = new CallbackQueue();
    let amt = 0;

    cbq.add(() => (amt += 1), 'add');
    cbq.add(() => (amt += 1), 'add');
    cbq.add(() => (amt += 1), 'add');
    cbq.add(() => (amt += 1), 'add');

    await cbq.waitUntilFinished();
    expect(amt).to.equal(4);
  });

  it('Should run things in the order they were added', async () => {
    const cbq = new CallbackQueue();
    let amt = 0;

    cbq.add(() => (amt = 1), 'set');
    cbq.add(() => (amt = 2), 'set');
    cbq.add(() => (amt = 3), 'set');
    cbq.add(() => (amt = 4), 'set');

    await cbq.waitUntilFinished();
    expect(amt).to.equal(4);
  });

  it("Should not break the queue if there's an error", async () => {
    const cbq = new CallbackQueue();
    let amt = 0;

    cbq.add(() => (amt += 1), 'add');
    cbq.add(() => (amt += 1), 'add');
    cbq.add(() => {
      throw new Error();
    });
    cbq.add(() => (amt += 1), 'add');
    cbq.add(() => (amt += 1), 'add');

    await cbq.waitUntilFinished();
    expect(amt).to.equal(4);
  });

  it('Should allow queued tasks to queue tasks', async () => {
    const cbq = new CallbackQueue();
    let amt = 0;

    cbq.add(() => (amt += 1), 'add');
    cbq.add(() => {
      amt += 1;
      cbq.add(() => (amt += 10), 'big add');
    }, 'messy add');
    cbq.add(() => (amt += 1), 'add');
    cbq.add(() => (amt += 1), 'add');

    await cbq.waitUntilFinished();
    expect(amt).to.equal(14);
  });
});
