import winston from 'winston';

import { sleep } from '@tupaia/utils';
import { ChangeHandler } from '../../server/changeHandlers/ChangeHandler';
import { getTestModels, upsertDummyRecord } from '../../server/testUtilities';
import { generateId } from '../../core/utilities';

const DEBOUNCE_TIME = 100; // short debounce time so tests run more quickly

describe('ChangeHandler', () => {
  const models = getTestModels();

  class TestChangeHandler extends ChangeHandler {
    constructor(modelsInstance) {
      super(modelsInstance, 'test-change-handler');

      this.resetMocks();
    }

    getChangeDebuggingInfo = changes => {
      return `Failed ids: ${changes}`;
    };

    handleChanges() {
      jest.fn().mockResolvedValue();
    }

    resetMocks = () => {
      this.changeTranslators = {
        project: jest.fn(changeDetails => [changeDetails.new_record?.id]),
        user: jest.fn(changeDetails => [changeDetails.new_record?.id]),
      };
      this.handleChanges = jest.fn().mockResolvedValue();
    };
  }

  const changeHandler = new TestChangeHandler(models);
  changeHandler.setDebounceTime(DEBOUNCE_TIME);

  beforeAll(async () => {
    changeHandler.listenForChanges();
  });

  beforeEach(() => {
    changeHandler.resetMocks();
  });

  afterAll(() => {
    changeHandler.stopListeningForChanges();
  });

  it('is not triggered if a record type with no translator is mutated', async () => {
    await upsertDummyRecord(models.indicator);
    await models.database.waitForAllChangeHandlers();

    expect(changeHandler.handleChanges).toHaveBeenCalledTimes(0);
  });

  it('is triggered if a record type with a translator is mutated', async () => {
    await upsertDummyRecord(models.project);
    await models.database.waitForAllChangeHandlers();
    expect(changeHandler.handleChanges).toHaveBeenCalledTimes(1);

    await upsertDummyRecord(models.user);
    await models.database.waitForAllChangeHandlers();
    expect(changeHandler.handleChanges).toHaveBeenCalledTimes(2);
  });

  it('translates changes before handling them', async () => {
    const record = await upsertDummyRecord(models.project);
    await models.database.waitForAllChangeHandlers();
    expect(changeHandler.handleChanges).toHaveBeenCalledOnceWith(expect.any(Object), [record.id]);
  });

  it('handles multiple changes in batches', async () => {
    // make a bunch of different changes, with small delays between each to model real life
    const sleepTime = DEBOUNCE_TIME / 2;

    // create
    const projectIds = [];
    for (let i = 0; i < 3; i++) {
      const projects = await upsertDummyRecord(models.project);
      projectIds.push(projects.id);
      await sleep(sleep);
    }

    // update
    await models.project.update({ id: projectIds[0] }, { description: 'Test project' });
    await sleep(sleepTime);

    // delete
    await models.project.delete({ id: projectIds[1] });
    await sleep(sleepTime);

    await models.database.waitForAllChangeHandlers();
    expect(changeHandler.handleChanges).toHaveBeenCalledTimes(1);
  });

  it('uses FIFO order', async () => {
    const submitProjectBatch = async () => {
      const projectIds = [];
      for (let i = 0; i < 3; i++) {
        const project = await upsertDummyRecord(models.project);
        projectIds.push(project.id);
      }
      return projectIds;
    };

    const projectIds1 = await submitProjectBatch();
    await models.database.waitForAllChangeHandlers();
    expect(changeHandler.handleChanges).toHaveBeenCalledOnceWith(expect.any(Object), projectIds1);
    changeHandler.resetMocks();

    const projectIds2 = await submitProjectBatch();
    await models.database.waitForAllChangeHandlers();
    expect(changeHandler.handleChanges).toHaveBeenCalledOnceWith(expect.any(Object), projectIds2);
  });

  it('only runs one queue handler at a time', async () => {
    let resolveOnQueueHandlerStart;
    let isQueueHandlerRunning = false;
    let queueHandlingCount = 0;

    changeHandler.handleChanges = jest.fn(async () => {
      if (resolveOnQueueHandlerStart) {
        resolveOnQueueHandlerStart();
      }
      expect(isQueueHandlerRunning).toBe(false); // assert against concurrent handlers
      isQueueHandlerRunning = true;
      queueHandlingCount++;
      // sleep for longer than the debounce time so that we're still handling when the next one
      // should be triggered
      await sleep(DEBOUNCE_TIME + 200);
      isQueueHandlerRunning = false;
    });

    // start queue handling
    changeHandler.scheduleChangeQueueHandler();
    const handlerOneStarted = new Promise(resolve => {
      resolveOnQueueHandlerStart = resolve;
    });

    // after queue handler one has started but not yet completed, schedule another queue handler
    await handlerOneStarted;
    expect(isQueueHandlerRunning).toBe(true);
    expect(queueHandlingCount).toBe(1);
    changeHandler.scheduleChangeQueueHandler();
    const handlerTwoStarted = new Promise(resolve => {
      resolveOnQueueHandlerStart = resolve;
    });

    // wait for longer than the debounce time, so the just scheduled queue handler would want
    // to start, but should still be processing the first handler
    await sleep(DEBOUNCE_TIME + 10);
    expect(isQueueHandlerRunning).toBe(true);
    expect(queueHandlingCount).toBe(1);

    // after handler two has started but not yet completed, schedule another few queue handlers
    // these should debounce and result in one more handler
    await handlerTwoStarted;
    expect(isQueueHandlerRunning).toBe(true);
    expect(queueHandlingCount).toBe(2);
    changeHandler.scheduleChangeQueueHandler();
    changeHandler.scheduleChangeQueueHandler();
    changeHandler.scheduleChangeQueueHandler();
    const finalHandlerPromise = changeHandler.scheduleChangeQueueHandler();

    // wait for longer than the debounce time, so the just scheduled handler would want to start,
    // but should still be running the second handler
    await sleep(DEBOUNCE_TIME + 10);
    expect(isQueueHandlerRunning).toBe(true);
    expect(queueHandlingCount).toBe(2);

    // wait for final handler to complete, then check a total of three were called
    await finalHandlerPromise;
    expect(isQueueHandlerRunning).toBe(false);
    expect(queueHandlingCount).toBe(3);
    expect(changeHandler.handleChanges).toHaveBeenCalledTimes(3);
  });

  describe('failure handling', () => {
    const rejectedId = generateId();
    const acceptedId = generateId();
    let processedIds = [];

    beforeAll(() => {
      jest.spyOn(winston, 'error').mockClear().mockImplementation();
    });

    beforeEach(() => {
      processedIds = [];
      changeHandler.handleChanges = jest.fn((transactingModels, changeIds) => {
        if (changeIds.includes(rejectedId)) {
          throw new Error(`Rejected id found: ${rejectedId}`);
        }
        processedIds.push(...changeIds);
      });
      winston.error.mockReset();
    });

    afterAll(() => {
      winston.error.mockRestore();
    });

    it('retries to handle a batch up to 3 times, then stops trying and logs an error', async () => {
      await upsertDummyRecord(models.project, { id: rejectedId });
      await models.database.waitForAllChangeHandlers();

      expect(changeHandler.handleChanges).toHaveBeenCalledTimes(3);
      expect(changeHandler.changeQueue).toHaveLength(0);
      expect(winston.error).toHaveBeenCalledOnceWith(
        expect.objectContaining(new RegExp(`Failed ids: ${rejectedId}`)),
      );
      expect(processedIds).toStrictEqual([]);
    });

    it('the whole batch fails if an error occurs', async () => {
      await upsertDummyRecord(models.project, { id: rejectedId });
      await upsertDummyRecord(models.project, { id: acceptedId });
      await models.database.waitForAllChangeHandlers();

      expect(changeHandler.handleChanges).toHaveBeenCalledTimes(3); // 3 retry attempts
      expect(changeHandler.changeQueue).toHaveLength(0);
      expect(winston.error).toHaveBeenCalledOnceWith(
        expect.objectContaining(new RegExp(`Failed ids: ${[rejectedId, acceptedId]}`)),
      );
      expect(processedIds).toStrictEqual([]);
    });

    it('valid future changes can still be queued and handled successfully', async () => {
      await upsertDummyRecord(models.project, { id: rejectedId });
      await sleep(2 * DEBOUNCE_TIME);
      await upsertDummyRecord(models.project, { id: acceptedId });
      await models.database.waitForAllChangeHandlers();

      // 3 failed attempts for the rejected project + 1 successful for the accepted project
      expect(changeHandler.handleChanges).toHaveBeenCalledTimes(4);
      expect(changeHandler.changeQueue).toHaveLength(0);
      expect(winston.error).toHaveBeenCalledOnceWith(
        expect.objectContaining(new RegExp(`Failed ids: ${rejectedId}`)),
      );
      expect(processedIds).toStrictEqual([acceptedId]);
    });
  });
});
