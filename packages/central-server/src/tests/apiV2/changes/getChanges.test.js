/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { oneSecondSleep, randomIntBetween } from '@tupaia/utils';
import { MeditrakSyncQueue, createPermissionsBasedMeditrakSyncQueue } from '../../../database';
import { TestableApp, upsertEntity, upsertQuestion, upsertSurveyGroup } from '../../testUtilities';

describe('GET /changes/count', async () => {
  const app = new TestableApp();
  const { models } = app;
  const meditrakSyncQueue = new MeditrakSyncQueue(models);

  before(async () => {
    await app.grantFullAccess();

    // Set up real sync queue for testing the /changes endpoint
    await createPermissionsBasedMeditrakSyncQueue(models.database);
    meditrakSyncQueue.setDebounceTime(100); // Faster debounce time for tests
    meditrakSyncQueue.listenForChanges();
  });

  after(() => {
    app.revokeAccess();
  });

  it('should return a number under the key "changeCount"', async function () {
    const response = await app.get('changes/count');
    expect(response.statusCode).to.equal(200);
    expect(response.body.changeCount).to.be.a('number');
  });

  it('should return the total number of update changes with no "since"', async function () {
    const correctChangeCount = await models.meditrakSyncQueue.count({ type: 'update' });
    const response = await app.get('changes/count');
    expect(response.body.changeCount).to.equal(correctChangeCount);
  });

  it('should return the correct number of changes since "since" if updates are made', async function () {
    const since = Date.now();
    const numberOfQuestionsToAdd = randomIntBetween(1, 20);
    const newQuestions = [];
    await oneSecondSleep();
    for (let i = 0; i < numberOfQuestionsToAdd; i++) {
      newQuestions[i] = await upsertQuestion();
    }
    // Wait one second for the triggers to have properly added the changes to the queue
    await oneSecondSleep();
    await meditrakSyncQueue.scheduleChangeQueueHandler();
    const response = await app.get(`changes/count?since=${since}`);
    expect(response.body.changeCount).to.equal(numberOfQuestionsToAdd);
  });

  it('should return the correct number of changes since "since" if updates and deletes are made', async function () {
    // Note: sync skips redundant deletes, i.e. any 'delete' records that reflect the deletion of a
    // record that the client has never seen are not synced to that client

    // Note that throughout this test we sleep before and after taking the timestamps as there is
    // overlap due to ids not being very fine grained

    // Add some questions
    await oneSecondSleep();
    const timestampBeforeFirstUpdate = Date.now();
    await oneSecondSleep();
    const numberOfQuestionsToAddInFirstUpdate = randomIntBetween(1, 20);
    const newQuestionsInFirstUpdate = [];
    for (let i = 0; i < numberOfQuestionsToAddInFirstUpdate; i++) {
      newQuestionsInFirstUpdate[i] = await upsertQuestion();
    }

    // Add some more questions
    await oneSecondSleep();
    const timestampBeforeSecondUpdate = Date.now();
    await oneSecondSleep();
    const numberOfQuestionsToAddInSecondUpdate = randomIntBetween(1, 20);
    const newQuestionsInSecondUpdate = [];
    for (let i = 0; i < numberOfQuestionsToAddInSecondUpdate; i++) {
      newQuestionsInSecondUpdate[i] = await upsertQuestion();
    }

    // Delete some of the questions added in the first update
    await oneSecondSleep();
    const timestampBeforeFirstDelete = Date.now();
    await oneSecondSleep();
    const numberOfQuestionsToDeleteFromFirstUpdate = randomIntBetween(
      1,
      numberOfQuestionsToAddInFirstUpdate,
    );
    for (let i = 0; i < numberOfQuestionsToDeleteFromFirstUpdate; i++) {
      await models.question.deleteById(newQuestionsInFirstUpdate[i].id);
    }

    // Delete some of the questions added in the second update
    await oneSecondSleep();
    const timestampBeforeSecondDelete = Date.now();
    await oneSecondSleep();
    const numberOfQuestionsToDeleteFromSecondUpdate = randomIntBetween(
      1,
      numberOfQuestionsToAddInSecondUpdate,
    );
    for (let i = 0; i < numberOfQuestionsToDeleteFromSecondUpdate; i++) {
      await models.question.deleteById(newQuestionsInSecondUpdate[i].id);
    }

    // Wait one second for the triggers to have properly added the changes to the queue
    await oneSecondSleep();

    // If syncing from before the first update, should only need to sync the number of records that
    // actually need to be added. No need to know about deletes of records we never integrated
    const grossNewRecords =
      numberOfQuestionsToAddInFirstUpdate + numberOfQuestionsToAddInSecondUpdate;
    const totalDeletes =
      numberOfQuestionsToDeleteFromFirstUpdate + numberOfQuestionsToDeleteFromSecondUpdate;
    const netNewRecords = grossNewRecords - totalDeletes;
    await meditrakSyncQueue.scheduleChangeQueueHandler();
    let response = await app.get(`changes/count?since=${timestampBeforeFirstUpdate}`);
    expect(response.body.changeCount).to.equal(netNewRecords);

    // If syncing from after both the updates but before the deletes, the changes needed will be all
    // of the deletes
    response = await app.get(`changes/count?since=${timestampBeforeFirstDelete}`);
    expect(response.body.changeCount).to.equal(totalDeletes);

    // If syncing from after the first update, but before the second, need to sync all deletes for
    // records from the first update, plus the net number of records that need to be added from the
    // second update
    const netNewRecordsFromSecondUpdate =
      numberOfQuestionsToAddInSecondUpdate - numberOfQuestionsToDeleteFromSecondUpdate;
    const netChangesSinceBeforeSecondUpdate =
      numberOfQuestionsToDeleteFromFirstUpdate + netNewRecordsFromSecondUpdate;
    response = await app.get(`changes/count?since=${timestampBeforeSecondUpdate}`);
    expect(response.body.changeCount).to.equal(netChangesSinceBeforeSecondUpdate);

    // If syncing from after the first delete but before the second, just need to sync all deletes
    // that happen in the second round of deletes
    response = await app.get(`changes/count?since=${timestampBeforeSecondDelete}`);
    expect(response.body.changeCount).to.equal(numberOfQuestionsToDeleteFromSecondUpdate);
  });

  it('should return the correct number of changes based on appVersion', async function () {
    const since = Date.now();
    // Wait one second for the triggers to have properly added the changes to the queue
    await oneSecondSleep();

    await upsertQuestion(); // version 0.0.1
    await upsertSurveyGroup(); // version 1.6.69
    await upsertEntity(); // version 1.7.102

    await oneSecondSleep();
    await meditrakSyncQueue.scheduleChangeQueueHandler();
    let response = await app.get(`changes/count?since=${since}&appVersion=0.0.1`);
    expect(response.body.changeCount).to.equal(1);

    response = await app.get(`changes/count?since=${since}&appVersion=1.6.69`);
    expect(response.body.changeCount).to.equal(2);

    response = await app.get(`changes/count?since=${since}&appVersion=1.7.102`);
    expect(response.body.changeCount).to.equal(3);
  });
});
