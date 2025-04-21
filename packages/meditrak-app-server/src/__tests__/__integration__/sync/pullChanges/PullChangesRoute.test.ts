/* eslint jest/expect-expect: ["warn", { "assertFunctionNames": ["expect", "expectMatchingChangeRecords"] }] */

import { constructAccessToken } from '@tupaia/auth';
import {
  clearTestData,
  DatabaseModel,
  getTestDatabase,
  getTestModels,
  upsertDummyRecord,
  buildAndInsertSurvey,
} from '@tupaia/database';
import { TestableServer } from '@tupaia/server-boilerplate';
import { oneSecondSleep, randomIntBetween, createBearerHeader } from '@tupaia/utils';
import {
  SyncableChangeEnqueuer,
  createPermissionsBasedMeditrakSyncQueue,
  getUnsupportedModelFields,
} from '../../../../sync';
import { MeditrakAppServerModelRegistry } from '../../../../types';
import { TestModelRegistry } from '../../../types';
import { grantUserAccess, revokeAccess, setupTestApp, setupTestUser } from '../../../utilities';
import { upsertDummyQuestion } from '../upsertDummyQuestion';
import {
  findRecordsWithPermissions,
  insertPermissionsBasedSyncTestData,
  LEGACY_SSC_CONFIGS,
  LEGACY_SSC_SURVEY,
  PERM_SYNC_COUNTRY_1,
  PERM_SYNC_COUNTRY_2,
  PERM_SYNC_PG_ADMIN,
  PERM_SYNC_PG_PUBLIC,
  PermissionsBasedSyncTestData,
} from './fixtures';
import { PERMISSIONS_BASED_SYNC_MIN_APP_VERSION } from '../../../../routes/sync/pullChanges/supportsPermissionsBasedSync';

type ChangeRecord = {
  recordType: string;
  record: Record<string, unknown>;
  action: string;
  timestamp: number;
};

const sortByRecordId = (r1: any, r2: any) => (r1.record.id > r2.record.id ? -1 : 1);

const expectMatchingChangeRecords = (
  actual: ChangeRecord[],
  expected: Omit<ChangeRecord, 'timestamp'>[],
) => {
  // Can't match timestamp, just just assert the field is there and check it's a number
  actual.forEach(changeRecord => expect(typeof changeRecord.timestamp).toBe('number'));
  const timestampFilteredActual = actual.map(changeRecord =>
    Object.entries(changeRecord).reduce<Record<string, unknown>>((obj, [fieldName, fieldValue]) => {
      if (fieldName === 'timestamp') return obj;

      obj[fieldName] = fieldValue;
      return obj;
    }, {}),
  );
  expect(timestampFilteredActual.sort(sortByRecordId)).toEqual(expected.sort(sortByRecordId));
};

describe('changes (GET)', () => {
  let app: TestableServer;
  let authHeader: string;
  let userId: string;
  const models = getTestModels() as TestModelRegistry;
  const syncableChangeEnqueuer = new SyncableChangeEnqueuer(
    getTestModels() as unknown as MeditrakAppServerModelRegistry,
  );
  syncableChangeEnqueuer.setDebounceTime(50);

  const recordToChange = async (
    recordType: string,
    record: any,
    changeType: 'update' | 'delete',
  ) => {
    if (changeType === 'delete') {
      return {
        action: 'delete',
        recordType,
        record: {
          id: record.id,
        },
      };
    }

    const modelName = models.getModelNameForDatabaseRecord(recordType);

    if (!modelName) {
      throw new Error(`Cannot find model for record type: ${recordType}`);
    }

    const fields = await (record.model as DatabaseModel).fetchFieldNames();
    const unsupportedFields = getUnsupportedModelFields(modelName);

    // Supported fields with non-null values
    const cleanedRecordForSync = Object.fromEntries(
      Object.entries(record).filter(
        ([field, value]) =>
          fields.includes(field) && !unsupportedFields.includes(field) && value !== null,
      ),
    );

    return {
      recordType,
      action: 'update',
      record: cleanedRecordForSync,
    };
  };

  beforeAll(async () => {
    await createPermissionsBasedMeditrakSyncQueue(models.database);
    syncableChangeEnqueuer.listenForChanges();
    app = await setupTestApp();

    const user = await setupTestUser();
    userId = user.id;
    authHeader = createBearerHeader(
      constructAccessToken({
        userId,
        apiClientUserId: undefined,
      }),
    );
    grantUserAccess(userId);
  });

  afterAll(async () => {
    revokeAccess();
    syncableChangeEnqueuer.stopListeningForChanges();
    await clearTestData(getTestDatabase());
  });

  it('throws an error if no auth header provided', async () => {
    const response = await app.get('changes');
    expect(response.statusCode).toEqual(500);
    expect(response.body.error).toMatch(/.*Authorization header required/);
  });

  it('should return the total number of update changes with no "since"', async () => {
    const questionCreated = await upsertDummyQuestion(models);
    const questionCreateAndDeleted = await upsertDummyQuestion(models);
    await models.database.waitForAllChangeHandlers();
    await models.question.deleteById(questionCreateAndDeleted.id);
    await models.database.waitForAllChangeHandlers();

    const response = await app.get('changes', {
      headers: {
        Authorization: authHeader,
      },
    });
    const expectedResults = await Promise.all([
      recordToChange('question', questionCreated, 'update'),
    ]);

    expectMatchingChangeRecords(response.body, expectedResults);
  });

  it('should return the correct number of changes since "since" if updates are made', async () => {
    const since = Date.now();
    const numberOfQuestionsToAdd = 3;
    const newQuestions = [];
    await oneSecondSleep();
    for (let i = 0; i < numberOfQuestionsToAdd; i++) {
      newQuestions.push(await upsertDummyQuestion(models));
    }

    await models.database.waitForAllChangeHandlers();

    const response = await app.get('changes', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since,
      },
    });

    const expectedResults = await Promise.all(
      newQuestions.map(questionCreated => recordToChange('question', questionCreated, 'update')),
    );
    expectMatchingChangeRecords(response.body, expectedResults);
  });

  it('should return the correct number of changes since "since" if updates and deletes are made', async () => {
    // Note: sync skips redundant deletes, i.e. any 'delete' records that reflect the deletion of a
    // record that the client has never seen are not synced to that client

    // Note that throughout this test we sleep before and after taking the timestamps as there is
    // overlap due to ids not being very fine grained

    // Add some questions
    const timestampBeforeFirstUpdate = Date.now();
    await oneSecondSleep();
    const numberOfQuestionsToAddInFirstUpdate = 3;
    const questionsInFirstUpdate = [];
    for (let i = 0; i < numberOfQuestionsToAddInFirstUpdate; i++) {
      questionsInFirstUpdate.push(await upsertDummyQuestion(models));
    }

    // Add some more questions
    await oneSecondSleep();

    // Wait for the triggers to have properly added the changes to the queue
    await models.database.waitForAllChangeHandlers();

    const timestampBeforeSecondUpdate = Date.now();
    await oneSecondSleep();
    const numberOfQuestionsToAddInSecondUpdate = 4;
    const questionsInSecondUpdate = [];
    for (let i = 0; i < numberOfQuestionsToAddInSecondUpdate; i++) {
      questionsInSecondUpdate.push(await upsertDummyQuestion(models));
    }

    // Delete some of the questions added in the first update
    await oneSecondSleep();

    // Wait for the triggers to have properly added the changes to the queue
    await models.database.waitForAllChangeHandlers();

    const timestampBeforeFirstDelete = Date.now();
    await oneSecondSleep();
    const numberOfQuestionsToDeleteFromFirstUpdate = randomIntBetween(
      1,
      numberOfQuestionsToAddInFirstUpdate,
    );
    const questionKeptFromFirstUpdate = questionsInFirstUpdate.slice(
      numberOfQuestionsToDeleteFromFirstUpdate,
    );
    const questionsDeletedFromFirstUpdate = questionsInFirstUpdate.slice(
      0,
      numberOfQuestionsToDeleteFromFirstUpdate,
    );
    for (let i = 0; i < numberOfQuestionsToDeleteFromFirstUpdate; i++) {
      await models.question.deleteById(questionsInFirstUpdate[i].id);
    }

    // Delete some of the questions added in the second update
    await oneSecondSleep();

    // Wait for the triggers to have properly added the changes to the queue
    await models.database.waitForAllChangeHandlers();

    const timestampBeforeSecondDelete = Date.now();
    await oneSecondSleep();
    const numberOfQuestionsToDeleteFromSecondUpdate = randomIntBetween(
      1,
      numberOfQuestionsToAddInSecondUpdate,
    );
    const questionKeptFromSecondUpdate = questionsInSecondUpdate.slice(
      numberOfQuestionsToDeleteFromSecondUpdate,
    );
    const questionsDeletedFromSecondUpdate = questionsInSecondUpdate.slice(
      0,
      numberOfQuestionsToDeleteFromSecondUpdate,
    );
    for (let i = 0; i < numberOfQuestionsToDeleteFromSecondUpdate; i++) {
      await models.question.deleteById(questionsInSecondUpdate[i].id);
    }

    await models.database.waitForAllChangeHandlers();

    // If syncing from before the first update, should only need to sync the number of records that
    // actually need to be added. No need to know about deletes of records we never integrated
    const keptQuestions = [...questionKeptFromFirstUpdate, ...questionKeptFromSecondUpdate];
    let expectedResults = await Promise.all(
      keptQuestions.map(questionCreated => recordToChange('question', questionCreated, 'update')),
    );
    let response = await app.get('changes', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since: timestampBeforeFirstUpdate,
      },
    });
    expectMatchingChangeRecords(response.body, expectedResults);

    // If syncing from after both the updates but before the deletes, the changes needed will be all
    // of the deletes
    const deletedQuestions = [
      ...questionsDeletedFromFirstUpdate,
      ...questionsDeletedFromSecondUpdate,
    ];
    expectedResults = await Promise.all(
      deletedQuestions.map(questionCreated =>
        recordToChange('question', questionCreated, 'delete'),
      ),
    );
    response = await app.get('changes', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since: timestampBeforeFirstDelete,
      },
    });
    expectMatchingChangeRecords(response.body, expectedResults);

    // If syncing from after the first update, but before the second, need to sync all deletes for
    // records from the first update, plus the net number of records that need to be added from the
    // second update
    expectedResults = await Promise.all(
      questionKeptFromSecondUpdate
        .map(questionCreated => recordToChange('question', questionCreated, 'update'))
        .concat(
          questionsDeletedFromFirstUpdate.map(questionCreated =>
            recordToChange('question', questionCreated, 'delete'),
          ),
        ),
    );
    response = await app.get('changes', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since: timestampBeforeSecondUpdate,
      },
    });
    expectMatchingChangeRecords(response.body, expectedResults);

    // If syncing from after the first delete but before the second, just need to sync all deletes
    // that happen in the second round of deletes
    expectedResults = await Promise.all(
      questionsDeletedFromSecondUpdate.map(questionCreated =>
        recordToChange('question', questionCreated, 'delete'),
      ),
    );
    response = await app.get('changes', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since: timestampBeforeSecondDelete,
      },
    });
    expectMatchingChangeRecords(response.body, expectedResults);
  });

  it('should return the correct number of changes based on the models the appVersion supports', async () => {
    const since = Date.now();
    await oneSecondSleep();

    const numberOfEntitiesToAdd = 2;
    const entitySupportedAppVersion = '1.7.102';
    const entityUnsupportedAppVersion = '1.7.101';

    const newEntities = [];
    for (let i = 0; i < numberOfEntitiesToAdd; i++) {
      newEntities.push(await upsertDummyRecord(models.entity, {}));
    }

    await models.database.waitForAllChangeHandlers();

    const entitySupportedResponse = await app.get('changes', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since,
        appVersion: entitySupportedAppVersion,
      },
    });
    const entityUnsupportedResponse = await app.get('changes', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since,
        appVersion: entityUnsupportedAppVersion,
      },
    });
    const expectedEntitySupportedResults = await Promise.all(
      newEntities.map(entityCreated => recordToChange('entity', entityCreated, 'update')),
    );
    expectMatchingChangeRecords(entitySupportedResponse.body, expectedEntitySupportedResults);
    expect(entityUnsupportedResponse.body).toEqual([]);
  });

  it('should return the correct number of changes based on the requested record types', async () => {
    const since = Date.now();
    await oneSecondSleep();

    const numberOfEntitiesToAdd = 2;
    const numberOfQuestionsToAdd = 3;

    const newEntities = [];
    for (let i = 0; i < numberOfEntitiesToAdd; i++) {
      newEntities.push(await upsertDummyRecord(models.entity, {}));
    }

    const newQuestions = [];
    for (let i = 0; i < numberOfQuestionsToAdd; i++) {
      newQuestions.push(await upsertDummyQuestion(models));
    }

    await models.database.waitForAllChangeHandlers();

    const entityChangesResponse = await app.get('changes', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since,
        recordTypes: 'entity',
      },
    });
    const questionChangesResponse = await app.get('changes', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since,
        recordTypes: 'question',
      },
    });
    const entityAndQuestionChangesResponse = await app.get('changes', {
      headers: {
        Authorization: authHeader,
      },
      query: {
        since,
        recordTypes: 'entity,question',
      },
    });
    const expectedEntityChangesResults = await Promise.all(
      newEntities.map(entityCreated => recordToChange('entity', entityCreated, 'update')),
    );
    const expectedQuestionChangesResults = await Promise.all(
      newQuestions.map(questionCreated => recordToChange('question', questionCreated, 'update')),
    );
    const expectedEntityAndQuestionChangesResults = [
      ...expectedEntityChangesResults,
      ...expectedQuestionChangesResults,
    ];
    expectMatchingChangeRecords(entityChangesResponse.body, expectedEntityChangesResults);
    expectMatchingChangeRecords(questionChangesResponse.body, expectedQuestionChangesResults);
    expectMatchingChangeRecords(
      entityAndQuestionChangesResponse.body,
      expectedEntityAndQuestionChangesResults,
    );
  });

  it('can paginate the results', async () => {
    const since = Date.now();
    const pageSize = 2;
    const numberOfQuestionsToAdd = 5;
    const newQuestions = [];
    await oneSecondSleep();
    for (let i = 0; i < numberOfQuestionsToAdd; i++) {
      newQuestions.push(await upsertDummyQuestion(models));
    }

    await models.database.waitForAllChangeHandlers();

    const expectedResults = await Promise.all(
      newQuestions.map(questionCreated => recordToChange('question', questionCreated, 'update')),
    );

    let changesPulled = 0;
    let pagesPulled = 0;
    while (changesPulled < numberOfQuestionsToAdd) {
      const response = await app.get('changes', {
        headers: {
          Authorization: authHeader,
        },
        query: {
          since,
          offset: pagesPulled * pageSize,
          limit: pageSize,
        },
      });

      expectMatchingChangeRecords(
        response.body,
        expectedResults.slice(changesPulled, changesPulled + pageSize),
      );
      pagesPulled += 1;
      changesPulled += pageSize;
    }
  });

  describe('permissions based syncing', () => {
    let testStartTime: number;
    let testData: PermissionsBasedSyncTestData;

    beforeAll(async () => {
      testStartTime = Date.now();
      app.setDefaultQueryParam('appVersion', PERMISSIONS_BASED_SYNC_MIN_APP_VERSION);

      testData = await insertPermissionsBasedSyncTestData(models);
      await models.database.waitForAllChangeHandlers();
    });

    describe('initial sync', () => {
      it('should return the number of changes for a user with limited access', async () => {
        revokeAccess();

        const permissions = { [PERM_SYNC_COUNTRY_1.code]: [PERM_SYNC_PG_PUBLIC.name] };
        grantUserAccess(userId, permissions);
        const response = await app.get('changes', {
          headers: {
            Authorization: authHeader,
          },
          query: {
            since: testStartTime,
          },
        });

        const expectedRecords = findRecordsWithPermissions(testData, permissions);
        const expectedChanges = await Promise.all(
          expectedRecords.map(({ type, record }) => recordToChange(type, record, 'update')),
        );

        expectMatchingChangeRecords(response.body, expectedChanges);
      });

      it('should return the number of changes for a user with full access', async () => {
        revokeAccess();

        const permissions = {
          [PERM_SYNC_COUNTRY_1.code]: [PERM_SYNC_PG_PUBLIC.name, PERM_SYNC_PG_ADMIN.name],
          [PERM_SYNC_COUNTRY_2.code]: [PERM_SYNC_PG_PUBLIC.name, PERM_SYNC_PG_ADMIN.name],
        };
        grantUserAccess(userId, permissions);
        const response = await app.get('changes', {
          headers: {
            Authorization: authHeader,
          },
          query: {
            since: testStartTime,
          },
        });

        const expectedRecords = findRecordsWithPermissions(testData, permissions);
        const expectedChanges = await Promise.all(
          expectedRecords.map(({ type, record }) => recordToChange(type, record, 'update')),
        );

        expectMatchingChangeRecords(response.body, expectedChanges);
      });
    });
  });

  describe('legacy support', () => {
    it('should translate survey_screen_component records to pre entity upsert schema', async () => {
      await oneSecondSleep();
      const testStartTime = Date.now();

      const { survey, questions, surveyScreen, surveyScreenComponents } =
        await buildAndInsertSurvey(models, LEGACY_SSC_SURVEY as any);
      await models.database.waitForAllChangeHandlers();

      const response = await app.get('changes', {
        headers: {
          Authorization: authHeader,
        },
        query: {
          appVersion: '1.11.123',
          since: testStartTime,
        },
      });

      const legacySSCs = surveyScreenComponents.map(ssc => {
        const question = questions.find(({ id }) => id === ssc.question_id);
        const legacyConfig = LEGACY_SSC_CONFIGS[question.code as keyof typeof LEGACY_SSC_CONFIGS];
        return { ...ssc, config: legacyConfig };
      });

      const expectedChanges = [
        await recordToChange('survey', survey, 'update'),
        await recordToChange('survey_screen', surveyScreen, 'update'),
        ...(await Promise.all(questions.map(q => recordToChange('question', q, 'update')))),
        ...(await Promise.all(
          legacySSCs.map(ssc => recordToChange('survey_screen_component', ssc, 'update')),
        )),
      ];

      expectMatchingChangeRecords(response.body, expectedChanges);
    });
  });
});
