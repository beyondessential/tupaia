/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { DebouncingQueue } from '../DebouncingQueue';

const DEBOUNCE_DURATION = 10;

describe.only('DebouncingQueue', () => {
  const assertExpectedTasksWereRun = async (taskHashes, expectedToRun) => {
    const queue = new DebouncingQueue(DEBOUNCE_DURATION);
    const tasksRun = [];
    await Promise.all(
      taskHashes.map((hash, i) => {
        tasksRun[i] = false;
        return queue.runTask(hash, () => {
          tasksRun[i] = true;
        });
      }),
    );
    expect(tasksRun).to.eql(expectedToRun);
  };

  it('Should complete a single task', async () => {
    const taskHashes = ['hash'];
    await assertExpectedTasksWereRun(taskHashes, [true]);
  });

  it('Should complete multiple tasks', async () => {
    const taskHashes = ['hash1', 'hash2', 'hash3'];
    await assertExpectedTasksWereRun(taskHashes, [true, true, true]);
  });

  it('Should skip repeated tasks, only completing most recent', async () => {
    const taskHashes = ['hash1', 'hash2', 'hash2', 'hash3'];
    await assertExpectedTasksWereRun(taskHashes, [true, false, true, true]);
  });
});
