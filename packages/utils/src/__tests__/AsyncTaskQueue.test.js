import sinon from 'sinon';

import { AsyncTaskQueue } from '../AsyncTaskQueue';

const sleep = milliseconds => {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
};

const BATCH_SIZE = 4; // must be even, as we halve it in some tests
const DEBOUNCE_TIME = 10;
const TASK_TIME = 100;
const createAsyncTask = result =>
  sinon.spy(() => new Promise(resolve => setTimeout(() => resolve(result), TASK_TIME)));
const createXTasks = numberOfTasks =>
  Array(numberOfTasks)
    .fill(1)
    .map((_, i) => createAsyncTask(i));

// TODO: Convert mocha to jest
/**
 * Skip for now.
 *
 * Reason: If using jest only, the @param TASK_TIME couldn't pass in (line 16),
 *
 * since jest.spyOn is writing in this way:
 *
 * const spy = jest.spyOn(video, 'play');
 *
 */
describe.skip('AsyncTaskQueue', () => {
  it('should process one task and return the result', async () => {
    const queue = new AsyncTaskQueue(BATCH_SIZE, DEBOUNCE_TIME);
    const task = createAsyncTask('Success!');
    const result = await queue.add(task);
    expect(task).to.have.been.calledOnceWithExactly();
    expect(result).toBe('Success!');
  });

  it('should process more than one task, in batches', async () => {
    const queue = new AsyncTaskQueue(BATCH_SIZE, DEBOUNCE_TIME);

    // create three batches of async tasks
    const tasks = createXTasks(BATCH_SIZE * 3);
    const promises = tasks.map(t => queue.add(t));

    // wait for a little bit, so the first batch of tasks should have been started
    await sleep(DEBOUNCE_TIME * 2);
    tasks.slice(0, BATCH_SIZE).forEach(t => {
      expect(t).to.have.been.calledOnceWithExactly();
    });

    // the second and third batches of tasks shouldn't have started yet, as it should still be
    // processing the first batch
    tasks.slice(BATCH_SIZE).forEach(t => expect(t).not.to.have.been.called);

    // wait for all of the tasks to be processed, and check they returned the correct results
    const results = await Promise.all(promises);
    tasks.forEach(t => expect(t).to.have.been.calledOnceWithExactly());
    results.forEach((p, i) => expect(p).toBe(i));
  });

  it('should process additional tasks added during processing', async () => {
    const queue = new AsyncTaskQueue(BATCH_SIZE, DEBOUNCE_TIME);

    // create a half batch of async tasks
    const halfBatch = createXTasks(BATCH_SIZE / 2);
    const halfBatchPromises = halfBatch.map(t => queue.add(t));

    // wait for the debounce time from those two, plus a little, so that the batch has definitely
    // started processing
    await sleep(DEBOUNCE_TIME * 2 + 10);

    // add another batch and a half of tasks
    const batchAndAHalf = createXTasks(BATCH_SIZE * 1.5);
    const batchAndAHalfPromises = batchAndAHalf.map(t => queue.add(t));

    // the first half batch should still be processing, with the rest waiting until that's done
    halfBatch.forEach(t => {
      expect(t).to.have.been.calledOnceWithExactly();
    });
    batchAndAHalf.forEach(t => expect(t).not.to.have.been.called);

    // wait for the first half batch of the tasks to be processed, plus a little bit
    await Promise.all(halfBatchPromises);
    await sleep(DEBOUNCE_TIME * 2);

    // the first batch of the batch and a half should now have been kicked off
    batchAndAHalf.slice(0, BATCH_SIZE).forEach(t => {
      expect(t).to.have.been.calledOnceWithExactly();
    });
    batchAndAHalf.slice(BATCH_SIZE).forEach(t => expect(t).not.to.have.been.called);

    // check all results were correct
    const halfBatchResults = await Promise.all(halfBatchPromises);
    halfBatchResults.forEach((p, i) => expect(p).toBe(i));
    const batchAndAHalfResults = await Promise.all(batchAndAHalfPromises);
    batchAndAHalfResults.forEach((p, i) => expect(p).toBe(i));
  });

  it('should process additional tasks added after queue is idle', async () => {
    const queue = new AsyncTaskQueue(BATCH_SIZE, DEBOUNCE_TIME);

    // create a half batch of async tasks
    const halfBatch = createXTasks(BATCH_SIZE / 2);
    const halfBatchPromises = halfBatch.map(t => queue.add(t));

    // wait until after that's finished processing, plus a bit, then add another batch and a half
    await Promise.all(halfBatchPromises);
    await sleep(DEBOUNCE_TIME * 2);
    const batchAndAHalf = createXTasks(BATCH_SIZE * 1.5);
    const batchAndAHalfPromises = batchAndAHalf.map(t => queue.add(t));

    // wait for a bit of debouncing time
    await sleep(DEBOUNCE_TIME * 2);

    // the queue should have been idle, so the first batch should have been kicked off
    batchAndAHalf.slice(0, BATCH_SIZE).forEach(t => {
      expect(t).to.have.been.calledOnceWithExactly();
    });
    batchAndAHalf.slice(BATCH_SIZE).forEach(t => expect(t).not.to.have.been.called);

    // check all results were correct
    const halfBatchResults = await Promise.all(halfBatchPromises);
    halfBatchResults.forEach((p, i) => expect(p).toBe(i));
    const batchAndAHalfResults = await Promise.all(batchAndAHalfPromises);
    batchAndAHalfResults.forEach((p, i) => expect(p).toBe(i));
  });
});
