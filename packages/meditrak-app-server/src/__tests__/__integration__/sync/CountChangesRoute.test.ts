/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { constructAccessToken } from '@tupaia/auth';
import { clearTestData, getTestDatabase, getTestModels, upsertDummyRecord } from '@tupaia/database';
import { TestableServer } from '@tupaia/server-boilerplate';
import { oneSecondSleep, randomIntBetween, createBearerHeader } from '@tupaia/utils';
import { SyncableChangeEnqueuer } from '../../../sync';
import { MeditrakAppServerModelRegistry } from '../../../types';
import { TestModelRegistry } from '../../types';
import { setupTestApp, setupTestUser } from '../../utilities';
import { CAT_USER_SESSION } from '../fixtures';

const upsertQuestion = async (models: TestModelRegistry) => {
  const dataElement = await upsertDummyRecord(models.dataElement, {
    service_type: 'tupaia',
  });
  return upsertDummyRecord(models.question, {
    code: dataElement.code,
    data_element_id: dataElement.id,
  });
};

describe('changes/count', () => {
  let app: TestableServer;
  let authHeader: string;
  const models = getTestModels() as TestModelRegistry;
  const syncableChangeEnqueuer = new SyncableChangeEnqueuer(
    getTestModels() as MeditrakAppServerModelRegistry,
  );
  syncableChangeEnqueuer.setDebounceTime(100);

  beforeAll(async () => {
    syncableChangeEnqueuer.listenForChanges();
    app = await setupTestApp();

    const user = await setupTestUser();
    authHeader = createBearerHeader(
      constructAccessToken({
        userId: user.id,
        refreshToken: CAT_USER_SESSION.refresh_token,
        apiClientUserId: undefined,
      }),
    );
  });

  afterAll(async () => {
    syncableChangeEnqueuer.stopListeningForChanges();
    await clearTestData(getTestDatabase());
  });

  it('throws an error if no auth header provided', async () => {
    const response = await app.get('changes/count');
    expect(response.statusCode).toEqual(500);
    expect(response.body.error).toMatch(/.*Authorization header required/);
  });

  it('should return a number under the key "changeCount"', async () => {
    const response = await app.get('changes/count', {
      headers: {
        Authorization: authHeader,
      },
    });
    expect(response.statusCode).toEqual(200);
    expect(typeof response.body.changeCount).toBe('number');
  });

  it('should return the total number of update changes with no "since"', async () => {
    const correctChangeCount = await models.meditrakSyncQueue.count({ type: 'update' });
    const response = await app.get('changes/count', {
      headers: {
        Authorization: authHeader,
      },
    });
    expect(response.body).toEqual({ changeCount: correctChangeCount });
  });

  it('should return the correct number of changes since "since" if updates are made', async () => {
    const since = Date.now();
    const numberOfQuestionsToAdd = randomIntBetween(1, 20);
    await oneSecondSleep();
    for (let i = 0; i < numberOfQuestionsToAdd; i++) {
      await upsertQuestion(models);
    }

    // Wait for the triggers to have properly added the changes to the queue
    await models.database.waitForAllChangeHandlers();
    const response = await app.get('changes/count', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since,
      },
    });
    expect(response.body).toEqual({ changeCount: numberOfQuestionsToAdd });
  });

  it('should return the correct number of changes since "since" if updates and deletes are made', async () => {
    // Note: sync skips redundant deletes, i.e. any 'delete' records that reflect the deletion of a
    // record that the client has never seen are not synced to that client

    // Note that throughout this test we sleep before and after taking the timestamps as there is
    // overlap due to ids not being very fine grained

    // Add some questions
    const timestampBeforeFirstUpdate = Date.now();
    await oneSecondSleep();
    const numberOfQuestionsToAddInFirstUpdate = randomIntBetween(1, 20);
    const newQuestionsInFirstUpdate = [];
    for (let i = 0; i < numberOfQuestionsToAddInFirstUpdate; i++) {
      newQuestionsInFirstUpdate[i] = await upsertQuestion(models);
    }

    // Add some more questions
    await oneSecondSleep();
    const timestampBeforeSecondUpdate = Date.now();
    await oneSecondSleep();
    const numberOfQuestionsToAddInSecondUpdate = randomIntBetween(1, 20);
    const newQuestionsInSecondUpdate = [];
    for (let i = 0; i < numberOfQuestionsToAddInSecondUpdate; i++) {
      newQuestionsInSecondUpdate[i] = await upsertQuestion(models);
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

    // Wait for the triggers to have properly added the changes to the queue
    await models.database.waitForAllChangeHandlers();

    // If syncing from before the first update, should only need to sync the number of records that
    // actually need to be added. No need to know about deletes of records we never integrated
    const grossNewRecords =
      numberOfQuestionsToAddInFirstUpdate + numberOfQuestionsToAddInSecondUpdate;
    const totalDeletes =
      numberOfQuestionsToDeleteFromFirstUpdate + numberOfQuestionsToDeleteFromSecondUpdate;
    const netNewRecords = grossNewRecords - totalDeletes;
    let response = await app.get('changes/count', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since: timestampBeforeFirstUpdate,
      },
    });
    expect(response.body).toEqual({ changeCount: netNewRecords });

    // If syncing from after both the updates but before the deletes, the changes needed will be all
    // of the deletes
    response = await app.get('changes/count', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since: timestampBeforeFirstDelete,
      },
    });
    expect(response.body).toEqual({ changeCount: totalDeletes });

    // If syncing from after the first update, but before the second, need to sync all deletes for
    // records from the first update, plus the net number of records that need to be added from the
    // second update
    const netNewRecordsFromSecondUpdate =
      numberOfQuestionsToAddInSecondUpdate - numberOfQuestionsToDeleteFromSecondUpdate;
    const netChangesSinceBeforeSecondUpdate =
      numberOfQuestionsToDeleteFromFirstUpdate + netNewRecordsFromSecondUpdate;
    response = await app.get('changes/count', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since: timestampBeforeSecondUpdate,
      },
    });
    expect(response.body).toEqual({ changeCount: netChangesSinceBeforeSecondUpdate });

    // If syncing from after the first delete but before the second, just need to sync all deletes
    // that happen in the second round of deletes
    response = await app.get('changes/count', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since: timestampBeforeSecondDelete,
      },
    });
    expect(response.body).toEqual({ changeCount: numberOfQuestionsToDeleteFromSecondUpdate });
  });

  it('should return the correct number of changes based on the models the appVersion supports', async () => {
    const since = Date.now();
    await oneSecondSleep();

    const numberOfEntitiesToAdd = randomIntBetween(1, 20);
    const entitySupportedAppVersion = '1.7.102';
    const entityUnsupportedAppVersion = '1.7.101';

    for (let i = 0; i < numberOfEntitiesToAdd; i++) {
      await upsertDummyRecord(models.entity, {});
    }

    // Wait for the triggers to have properly added the changes to the queue
    await models.database.waitForAllChangeHandlers();
    const entitySupportedResponse = await app.get('changes/count', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since,
        appVersion: entitySupportedAppVersion,
      },
    });
    const entityUnsupportedResponse = await app.get('changes/count', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since,
        appVersion: entityUnsupportedAppVersion,
      },
    });
    expect(entitySupportedResponse.body).toEqual({ changeCount: numberOfEntitiesToAdd });
    expect(entityUnsupportedResponse.body).toEqual({ changeCount: 0 });
  });

  it('should return the correct number of changes based on the requested record types', async () => {
    const since = Date.now();
    await oneSecondSleep();

    const numberOfEntitiesToAdd = randomIntBetween(1, 20);
    const numberOfQuestionsToAdd = randomIntBetween(1, 20);

    for (let i = 0; i < numberOfEntitiesToAdd; i++) {
      await upsertDummyRecord(models.entity, {});
    }

    for (let i = 0; i < numberOfQuestionsToAdd; i++) {
      await upsertQuestion(models);
    }

    // Wait for the triggers to have properly added the changes to the queue
    await models.database.waitForAllChangeHandlers();
    const entityChangesResponse = await app.get('changes/count', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since,
        recordTypes: 'entity',
      },
    });
    const questionChangesResponse = await app.get('changes/count', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since,
        recordTypes: 'question',
      },
    });
    const entityAndQuestionChangesResponse = await app.get('changes/count', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since,
        recordTypes: 'entity,question',
      },
    });
    expect(entityChangesResponse.body).toEqual({ changeCount: numberOfEntitiesToAdd });
    expect(questionChangesResponse.body).toEqual({ changeCount: numberOfQuestionsToAdd });
    expect(entityAndQuestionChangesResponse.body).toEqual({
      changeCount: numberOfEntitiesToAdd + numberOfQuestionsToAdd,
    });
  });
});
