import {
  getTestModels,
  findOrCreateDummyRecord,
  generateId,
  clearTestData,
} from '@tupaia/database';
import { CentralSyncManager } from '../sync';
import { FACT_CURRENT_SYNC_TICK, FACT_LOOKUP_UP_TO_TICK } from '@tupaia/constants';
import {
  createSnapshotTable,
  findSyncSnapshotRecords,
  getModelsForPull,
  SYNC_SESSION_DIRECTION,
} from '@tupaia/sync';

import { snapshotOutgoingChanges } from '../sync/snapshotOutgoingChanges';
import { SyncLookupQueryDetails, TestSyncServerModelRegistry } from '../types';

const SYNC_CONFIG = {
  maxRecordsPerSnapshotChunk: 10_000,
  lookupTable: {
    perModelUpdateTimeoutMs: 1_000_000,
    avoidRepull: false,
  },
  snapshotTransactionTimeoutMs: 10 * 60 * 1000,
  syncSessionTimeoutMs: 20 * 60 * 1000,
  maxConcurrentSessions: 10,
};

describe('Sync Lookup data', () => {
  let models: TestSyncServerModelRegistry;
  let centralSyncManager: CentralSyncManager;
  let deviceId: string;
  let sessionId: string;
  let project: any;
  let entity1: any;
  let entity2: any;
  let entityHierarchy: any;
  let optionSet: any;
  let permissionGroup: any;
  let survey: any;
  let surveyGroup: any;
  let surveyResponse: any;
  let surveyScreen: any;
  let question: any;
  let task: any;
  let userAccount: any;

  const prepareData = async () => {
    deviceId = generateId();
    userAccount = await findOrCreateDummyRecord(models.user, {
      email: 'test_user_account@email.com',
      first_name: 'Test',
      last_name: 'User Account',
    });
    await findOrCreateDummyRecord(models.country, { code: 'test_country' });
    entityHierarchy = await findOrCreateDummyRecord(models.entityHierarchy, {
      name: 'test_entity_hierarchy',
      canonical_types: '{country}',
    });
    project = await findOrCreateDummyRecord(models.project, {
      code: 'test_project',
      description: 'Test Project',
      entity_hierarchy_id: entityHierarchy.id,
    });
    entity1 = await findOrCreateDummyRecord(models.entity, {
      code: 'test_entity',
      name: 'Test Entity',
      type: 'village',
    });
    entity2 = await findOrCreateDummyRecord(models.entity, {
      code: 'test_entity2',
      name: 'Test Entity 2',
      type: 'facility',
    });
    await findOrCreateDummyRecord(models.entityParentChildRelation, {
      entity_hierarchy_id: entityHierarchy.id,
      parent_id: entity1.id,
      child_id: entity2.id,
    });
    optionSet = await findOrCreateDummyRecord(models.optionSet, { name: 'test_option_set' });
    await findOrCreateDummyRecord(models.option, {
      label: 'Test Option',
      option_set_id: optionSet.id,
      value: 'test_option',
    });
    permissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'test_permission_group',
    });
    surveyGroup = await findOrCreateDummyRecord(models.surveyGroup, { name: 'Test Survey Group' });
    survey = await findOrCreateDummyRecord(models.survey, {
      code: 'test_survey',
      name: 'Test Survey',
      permission_group_id: permissionGroup.id,
      project_id: project.id,
      survey_group_id: surveyGroup.id,
    });

    surveyResponse = await findOrCreateDummyRecord(models.surveyResponse, {
      survey_id: survey.id,
      entity_id: entity1.id,
      user_id: userAccount.id,
      assessor_name: 'Test User',
      start_time: new Date(),
      end_time: new Date(),
      data_time: new Date(),
    });
    surveyScreen = await findOrCreateDummyRecord(models.surveyScreen, { survey_id: survey.id });
    question = await findOrCreateDummyRecord(models.question, {
      code: 'test_question',
      name: 'Test Question',
      type: 'FreeText',
    });
    await findOrCreateDummyRecord(models.surveyScreenComponent, {
      screen_id: surveyScreen.id,
      question_id: question.id,
      component_number: 1,
    });
    await findOrCreateDummyRecord(models.answer, {
      question_id: question.id,
      survey_response_id: surveyResponse.id,
      type: 'FreeText',
      text: 'Test Answer',
    });
    task = await findOrCreateDummyRecord(models.task, {
      survey_id: survey.id,
      entity_id: entity1.id,
    });
    await findOrCreateDummyRecord(models.taskComment, {
      task_id: task.id,
      user_id: userAccount.id,
      message: 'Test Task Comment',
    });
    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount.id,
      entity_id: entity1.id,
      permission_group_id: permissionGroup.id,
    });
  };

  beforeAll(async () => {
    models = getTestModels() as TestSyncServerModelRegistry;
    await clearTestData(models.database);

    centralSyncManager = new CentralSyncManager(models);

    await models.localSystemFact.set(FACT_CURRENT_SYNC_TICK, 4);
    await models.localSystemFact.set(FACT_LOOKUP_UP_TO_TICK, -1);

    await prepareData();
    await centralSyncManager.updateLookupTable();
  });

  beforeEach(async () => {
    sessionId = generateId();
    await createSnapshotTable(models.database, sessionId);
    await models.localSystemFact.set(FACT_CURRENT_SYNC_TICK, 4);
    await models.localSystemFact.set(FACT_LOOKUP_UP_TO_TICK, -1);
    await models.syncDeviceTick.delete({});
    await models.syncSession.delete({});
    await models.syncQueuedDevice.delete({});

    jest.resetModules();
    jest.clearAllMocks();
  });

  it('Snapshots project linked records when it is a newly selected project', async () => {
    const since = -1;
    const outgoingModels = getModelsForPull(models.getModels());
    await snapshotOutgoingChanges(
      models.database,
      outgoingModels,
      since,
      sessionId,
      deviceId,
      SYNC_CONFIG,
      [project.id],
    );

    const syncLookupData = await models.syncLookup.find({});

    for (const model of outgoingModels) {
      const hasCustomLookupQuery =
        'buildSyncLookupQueryDetails' in model &&
        typeof model.buildSyncLookupQueryDetails === 'function';
      const syncLookupQueryDetails: SyncLookupQueryDetails = hasCustomLookupQuery
        ? await (model.buildSyncLookupQueryDetails as Function)()
        : null;

      if (!syncLookupQueryDetails) {
        continue;
      }

      const syncLookupRecord = syncLookupData.find(
        (d: any) => d.record_type === model.databaseRecord,
      );

      if (!syncLookupRecord) {
        throw new Error(
          `Cannot find sync lookup record of type '${model.databaseRecord}' when it is a full snapshot for marked for sync patients`,
        );
      }

      expect(syncLookupRecord).toEqual(
        expect.objectContaining({
          data: expect.anything(),
          record_id: expect.anything(),
          record_type: model.databaseRecord,
          project_ids: expect.anything(),
          is_deleted: false,
        }),
      );
    }

    const outgoingSnapshotRecords = await findSyncSnapshotRecords(
      models.database,
      sessionId,
      undefined,
      undefined,
      undefined,
      SYNC_SESSION_DIRECTION.OUTGOING,
    );

    for (const model of outgoingModels) {
      const outgoingSnapshotRecord = outgoingSnapshotRecords.find(
        r => r.recordType === model.databaseRecord,
      );

      if (!outgoingSnapshotRecord) {
        throw new Error(
          `Cannot find snapshot record of type '${model.databaseRecord}' when it is a full snapshot for marked for sync patients`,
        );
      }

      expect(outgoingSnapshotRecord).toEqual(
        expect.objectContaining({
          recordId: expect.anything(),
          recordType: model.databaseRecord,
          data: expect.anything(),
          isDeleted: false,
        }),
      );
    }
  });

  it('Snapshots non records when it is a newly selected project', async () => {
    const since = -1;
    const outgoingModels = getModelsForPull(models.getModels());
    await snapshotOutgoingChanges(
      models.database,
      outgoingModels,
      since,
      sessionId,
      deviceId,
      SYNC_CONFIG,
      [project.id],
    );

    const syncLookupData = await models.syncLookup.find({});

    for (const model of outgoingModels) {
      const hasCustomLookupQuery =
        'buildSyncLookupQueryDetails' in model &&
        typeof model.buildSyncLookupQueryDetails === 'function';
      const syncLookupQueryDetails: SyncLookupQueryDetails = hasCustomLookupQuery
        ? await (model.buildSyncLookupQueryDetails as Function)()
        : null;

      if (syncLookupQueryDetails) {
        continue;
      }

      const syncLookupRecord = syncLookupData.find(
        (d: any) => d.record_type === model.databaseRecord,
      );

      if (!syncLookupRecord) {
        throw new Error(
          `Cannot find sync lookup record of type '${model.databaseRecord}' when it is a full snapshot for marked for sync patients`,
        );
      }

      expect(syncLookupRecord).toEqual(
        expect.objectContaining({
          data: expect.anything(),
          record_id: expect.anything(),
          record_type: model.databaseRecord,
          project_ids: null,
          is_deleted: false,
        }),
      );
    }

    const outgoingSnapshotRecords = await findSyncSnapshotRecords(
      models.database,
      sessionId,
      undefined,
      undefined,
      undefined,
      SYNC_SESSION_DIRECTION.OUTGOING,
    );

    for (const model of outgoingModels) {
      const hasCustomLookupQuery =
        'buildSyncLookupQueryDetails' in model &&
        typeof model.buildSyncLookupQueryDetails === 'function';
      const syncLookupQueryDetails: SyncLookupQueryDetails = hasCustomLookupQuery
        ? await (model.buildSyncLookupQueryDetails as Function)()
        : null;

      if (syncLookupQueryDetails) {
        continue;
      }

      const outgoingSnapshotRecord = outgoingSnapshotRecords.find(
        r => r.recordType === model.databaseRecord,
      );

      if (!outgoingSnapshotRecord) {
        throw new Error(
          `Cannot find snapshot record of type '${model.databaseRecord}' when it is a full snapshot for marked for sync patients`,
        );
      }

      expect(outgoingSnapshotRecord).toEqual(
        expect.objectContaining({
          recordId: expect.anything(),
          recordType: model.databaseRecord,
          data: expect.anything(),
          isDeleted: false,
        }),
      );
    }
  });

  it('Populates updated_at_sync_tick with ticks from actual tables when first build sync_lookup table', async () => {
    await models.localSystemFact.set(FACT_LOOKUP_UP_TO_TICK, -1); // -1 means first build

    await centralSyncManager.updateLookupTable();

    const newUserAccount = await models.user.findById(userAccount.id);
    const userAccountLookupData = await models.syncLookup.findOne({
      record_id: userAccount.id,
    });

    expect(userAccountLookupData).toMatchObject({
      record_id: userAccount.id,
      record_type: 'user_account',
      updated_at_sync_tick: newUserAccount.updated_at_sync_tick.toString(),
    });
  });

  it('Populates updated_at_sync_tick with the current tick when incrementally update the sync_lookup table', async () => {
    const CURRENT_SYNC_TICK = 7;
    await models.localSystemFact.set(FACT_CURRENT_SYNC_TICK, CURRENT_SYNC_TICK);
    await models.localSystemFact.set(FACT_LOOKUP_UP_TO_TICK, 1);

    await models.user.updateById(userAccount.id, { first_name: 'Test User 2' });

    await findOrCreateDummyRecord(models.user, {
      email: 'test_user_account_2@email.com',
      first_name: 'Test',
      last_name: 'User Account 2',
    });

    const expectedTick = CURRENT_SYNC_TICK + 3; // + 3 because tickTocked twice
    const expectedTock = CURRENT_SYNC_TICK + 4; // + 4 because tickTocked twice
    const originalTickTockImplementation = centralSyncManager.tickTockGlobalClock;

    const spy = jest
      .spyOn(centralSyncManager, 'tickTockGlobalClock')
      .mockImplementationOnce(originalTickTockImplementation)
      .mockImplementationOnce(async () => ({
        tick: expectedTick,
        tock: expectedTock,
      }));

    await centralSyncManager.updateLookupTable();

    const userAccountLookupData = await models.syncLookup.find({ record_type: 'user_account' });

    expect(userAccountLookupData.length).toEqual(2);

    userAccountLookupData.forEach(() => {
      expect.objectContaining({
        record_type: 'user_account',
        updated_at_sync_tick: expectedTick.toString(),
      });
    });

    spy.mockRestore();
  });

  describe('avoidRepull', () => {
    const snapshotOutgoingRecordsForFacility = async (avoidRepull: boolean) => {
      const deviceId = 'facility-a';
      await models.localSystemFact.set(FACT_CURRENT_SYNC_TICK, 4);
      await findOrCreateDummyRecord(models.user, {
        email: 'push_user_account_3@email.com',
        first_name: 'Test',
        last_name: 'User Account 3',
      });

      const pushedUserFromCurrentDevice = await models.user.findOne({
        email: 'push_user_account_3@email.com',
      });

      // Set new sync time so that it does not match the SyncDeviceTick record
      // in order to have it included in the snapshot.
      await models.localSystemFact.set(FACT_CURRENT_SYNC_TICK, 5);
      await findOrCreateDummyRecord(models.user, {
        email: 'push_user_account_4@email.com',
        first_name: 'Test',
        last_name: 'User Account 4',
      });
      const pushedUserFromAnotherDevice = await models.user.findOne({
        email: 'push_user_account_4@email.com',
      });

      await models.syncDeviceTick.create({
        device_id: deviceId,
        persisted_at_sync_tick: pushedUserFromCurrentDevice.updated_at_sync_tick.toString(),
      });

      await models.localSystemFact.set(FACT_LOOKUP_UP_TO_TICK, -1);
      const centralSyncManager = new CentralSyncManager(models, {
        lookupTable: {
          perModelUpdateTimeoutMs: 1_000_000,
          avoidRepull,
        },
      });

      await centralSyncManager.updateLookupTable();

      await snapshotOutgoingChanges(
        models.database,
        models.getModels(),
        -1,
        sessionId,
        deviceId,
        { ...SYNC_CONFIG, lookupTable: { ...SYNC_CONFIG.lookupTable, avoidRepull } },
        [project.id],
      );

      const outgoingSnapshotRecords = await findSyncSnapshotRecords(models.database, sessionId);

      return {
        outgoingSnapshotRecords,
        pushedUserFromCurrentDevice,
        pushedUserFromAnotherDevice,
      };
    };

    it("Avoids repull data for a device when 'avoidRepull' feature flag is enabled", async () => {
      const { outgoingSnapshotRecords, pushedUserFromCurrentDevice, pushedUserFromAnotherDevice } =
        await snapshotOutgoingRecordsForFacility(true);
      const snapshotPushedPatientFromCurrentFacility = outgoingSnapshotRecords.find(
        r => r.recordId === pushedUserFromCurrentDevice.id,
      );
      const snapshotPushedUserFromAnotherDevice = outgoingSnapshotRecords.find(
        r => r.recordId === pushedUserFromAnotherDevice.id,
      );

      expect(snapshotPushedPatientFromCurrentFacility).not.toBeDefined();
      expect(snapshotPushedUserFromAnotherDevice).toBeDefined();
    });

    it("Repulls data for a device when 'avoidRepull' feature flag is disabled", async () => {
      const { outgoingSnapshotRecords, pushedUserFromCurrentDevice, pushedUserFromAnotherDevice } =
        await snapshotOutgoingRecordsForFacility(false);
      const snapshotPushedPatientFromCurrentFacility = outgoingSnapshotRecords.find(
        r => r.recordId === pushedUserFromCurrentDevice.id,
      );
      const snapshotPatientFromAnotherFacility = outgoingSnapshotRecords.find(
        r => r.recordId === pushedUserFromAnotherDevice.id,
      );

      expect(snapshotPushedPatientFromCurrentFacility).toBeDefined();
      expect(snapshotPatientFromAnotherFacility).toBeDefined();
    });
  });
});
