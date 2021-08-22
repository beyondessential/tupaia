/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';
import winston from 'winston';

import { sleep } from '@tupaia/utils';
import { ChangeHandler } from '../../changeHandlers/ChangeHandler';
import { generateTestId, getTestModels, upsertDummyRecord } from '../../testUtilities';

const DEBOUNCE_TIME = 100; // short debounce time so tests run more quickly

describe('ChangeHandler', () => {
  const models = getTestModels();

  class TestChangeHandler extends ChangeHandler {
    constructor(modelsInstance) {
      super(modelsInstance);

      this.resetMocks();
    }

    getChangeDebuggingInfo = changes => {
      return `Failed ids: ${changes}`;
    };

    handleChanges = sinon.stub().resolves();

    resetMocks = () => {
      this.changeTranslators = {
        project: sinon.stub().callsFake(changeDetails => [changeDetails.new_record?.id]),
        user: sinon.stub().callsFake(changeDetails => [changeDetails.new_record?.id]),
      };
      this.handleChanges = sinon.stub().resolves();
    };
  }

  const changeHandler = new TestChangeHandler(models);
  changeHandler.setDebounceTime(DEBOUNCE_TIME);

  before(async () => {
    changeHandler.listenForChanges();
  });

  beforeEach(() => {
    changeHandler.resetMocks();
  });

  after(() => {
    changeHandler.stopListeningForChanges();
  });

  it('is not triggered if a record type with no translator is mutated', async () => {
    await upsertDummyRecord(models.indicator);
    await models.database.waitForAllChangeHandlers();

    expect(changeHandler.handleChanges).to.have.callCount(0);
  });

  it('is triggered if a record type with a translator is mutated', async () => {
    await upsertDummyRecord(models.project);
    await models.database.waitForAllChangeHandlers();
    expect(changeHandler.handleChanges).to.have.callCount(1);

    await upsertDummyRecord(models.user);
    await models.database.waitForAllChangeHandlers();
    expect(changeHandler.handleChanges).to.have.callCount(2);
  });

  it('translates changes before handling them', async () => {
    const record = await upsertDummyRecord(models.project);
    await models.database.waitForAllChangeHandlers();
    expect(changeHandler.handleChanges).to.have.been.calledOnceWith([record.id]);
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
    expect(changeHandler.handleChanges).to.have.callCount(1);
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
    expect(changeHandler.handleChanges).to.have.been.calledOnceWith(projectIds1);
    changeHandler.resetMocks();

    const projectIds2 = await submitProjectBatch();
    await models.database.waitForAllChangeHandlers();
    expect(changeHandler.handleChanges).to.have.been.calledOnceWith(projectIds2);
  });

  it('only runs one queue handler at a time', async () => {
    let resolveOnQueueHandlerStart;
    let isQueueHandlerRunning = false;
    let queueHandlingCount = 0;

    changeHandler.handleChanges = sinon.stub().callsFake(async () => {
      if (resolveOnQueueHandlerStart) {
        resolveOnQueueHandlerStart();
      }
      expect(isQueueHandlerRunning).to.equal(false); // assert against concurrent handlers
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
    expect(isQueueHandlerRunning).to.equal(true);
    expect(queueHandlingCount).to.equal(1);
    changeHandler.scheduleChangeQueueHandler();
    const handlerTwoStarted = new Promise(resolve => {
      resolveOnQueueHandlerStart = resolve;
    });

    // wait for longer than the debounce time, so the just scheduled queue handler would want
    // to start, but should still be processing the first handler
    await sleep(DEBOUNCE_TIME + 10);
    expect(isQueueHandlerRunning).to.equal(true);
    expect(queueHandlingCount).to.equal(1);

    // after handler two has started but not yet completed, schedule another few queue handlers
    // these should debounce and result in one more handler
    await handlerTwoStarted;
    expect(isQueueHandlerRunning).to.equal(true);
    expect(queueHandlingCount).to.equal(2);
    changeHandler.scheduleChangeQueueHandler();
    changeHandler.scheduleChangeQueueHandler();
    changeHandler.scheduleChangeQueueHandler();
    const finalHandlerPromise = changeHandler.scheduleChangeQueueHandler();

    // wait for longer than the debounce time, so the just scheduled handler would want to start,
    // but should still be running the second handler
    await sleep(DEBOUNCE_TIME + 10);
    expect(isQueueHandlerRunning).to.equal(true);
    expect(queueHandlingCount).to.equal(2);

    // wait for final handler to complete, then check a total of three were called
    await finalHandlerPromise;
    expect(isQueueHandlerRunning).to.equal(false);
    expect(queueHandlingCount).to.equal(3);
    expect(changeHandler.handleChanges).to.have.been.calledThrice;
  });

  describe('failure handling', () => {
    const rejectedId = generateTestId();
    const acceptedId = generateTestId();
    let processedIds = [];

    before(() => {
      sinon.stub(winston, 'error');
    });

    beforeEach(() => {
      processedIds = [];
      changeHandler.handleChanges = sinon.stub().callsFake(changeIds => {
        if (changeIds.includes(rejectedId)) {
          throw new Error(`Rejected id found: ${rejectedId}`);
        }
        processedIds.push(...changeIds);
      });
      winston.error.resetHistory();
    });

    after(() => {
      winston.error.restore();
    });

    it('retries to handle a batch up to 3 times, then stops trying and logs an error', async () => {
      await upsertDummyRecord(models.project, { id: rejectedId });
      await models.database.waitForAllChangeHandlers();

      expect(changeHandler.handleChanges).to.have.callCount(3);
      expect(changeHandler.changeQueue).to.have.length(0);
      expect(winston.error).to.have.been.calledOnceWith(
        sinon.match(new RegExp(`Failed ids: ${rejectedId}`)),
      );
      expect(processedIds).to.deep.equal([]);
    });

    it('the whole batch fails if an error occurs', async () => {
      await upsertDummyRecord(models.project, { id: rejectedId });
      await upsertDummyRecord(models.project, { id: acceptedId });
      await models.database.waitForAllChangeHandlers();

      expect(changeHandler.handleChanges).to.have.callCount(3); // 3 retry attempts
      expect(changeHandler.changeQueue).to.have.length(0);
      expect(winston.error).to.have.been.calledOnceWith(
        sinon.match(new RegExp(`Failed ids: ${[rejectedId, acceptedId]}`)),
      );
      expect(processedIds).to.deep.equal([]);
    });

    it('valid future changes can still be queued and handled successfully', async () => {
      await upsertDummyRecord(models.project, { id: rejectedId });
      await sleep(2 * DEBOUNCE_TIME);
      await upsertDummyRecord(models.project, { id: acceptedId });
      await models.database.waitForAllChangeHandlers();

      // 3 failed attempts for the rejected project + 1 successful for the accepted project
      expect(changeHandler.handleChanges).to.have.callCount(4);
      expect(changeHandler.changeQueue).to.have.length(0);
      expect(winston.error).to.have.been.calledOnceWith(
        sinon.match(new RegExp(`Failed ids: ${rejectedId}`)),
      );
      expect(processedIds).to.deep.equal([acceptedId]);
    });
  });
});
