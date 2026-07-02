import chai from 'chai';

import { oneSecondSleep, randomIntBetween } from '@tupaia/utils';
import { generateId } from '@tupaia/database';
import { MeditrakSyncQueue, createPermissionsBasedMeditrakSyncQueue } from '../../../database';
import {
  TestableApp,
  upsertEntity,
  upsertQuestion,
  upsertSurveyGroup,
  upsertSurveyScreen,
  upsertSurveyScreenComponent,
  upsertSurvey,
  upsertCountry,
  upsertProject,
} from '../../testUtilities';

const { expect } = chai;

describe('GET /changes/*', async () => {
  const app = new TestableApp();
  const { models } = app;
  const meditrakSyncQueue = new MeditrakSyncQueue(models);

  before(async () => {
    await app.grantFullAccess();

    // Set up real sync queue for testing the /changes endpoint
    await createPermissionsBasedMeditrakSyncQueue(models.database);
    meditrakSyncQueue.setDebounceTime(50); // Faster debounce time for tests
    meditrakSyncQueue.listenForChanges();
  });

  after(() => {
    meditrakSyncQueue.stopListeningForChanges();
    app.revokeAccess();
  });

  describe('GET /changes/count', async () => {
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
      // Wait for the triggers to have properly added the changes to the queue
      await models.database.waitForAllChangeHandlers();
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

      // Wait for the triggers to have properly added the changes to the queue
      await models.database.waitForAllChangeHandlers();

      const timestampBeforeSecondUpdate = Date.now();
      await oneSecondSleep();
      const numberOfQuestionsToAddInSecondUpdate = randomIntBetween(1, 20);
      const newQuestionsInSecondUpdate = [];
      for (let i = 0; i < numberOfQuestionsToAddInSecondUpdate; i++) {
        newQuestionsInSecondUpdate[i] = await upsertQuestion();
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
      for (let i = 0; i < numberOfQuestionsToDeleteFromFirstUpdate; i++) {
        await models.question.deleteById(newQuestionsInFirstUpdate[i].id);
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
      for (let i = 0; i < numberOfQuestionsToDeleteFromSecondUpdate; i++) {
        await models.question.deleteById(newQuestionsInSecondUpdate[i].id);
      }

      // Wait for the triggers to have properly added the changes to the queue
      await oneSecondSleep();
      await models.database.waitForAllChangeHandlers();

      // If syncing from before the first update, should only need to sync the number of records that
      // actually need to be added. No need to know about deletes of records we never integrated
      const grossNewRecords =
        numberOfQuestionsToAddInFirstUpdate + numberOfQuestionsToAddInSecondUpdate;
      const totalDeletes =
        numberOfQuestionsToDeleteFromFirstUpdate + numberOfQuestionsToDeleteFromSecondUpdate;
      const netNewRecords = grossNewRecords - totalDeletes;
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

      await upsertQuestion({}); // version 0.0.1
      await upsertSurveyGroup(); // version 1.6.69
      await upsertEntity(); // version 1.7.102

      await oneSecondSleep();
      // Wait for the triggers to have properly added the changes to the queue
      await models.database.waitForAllChangeHandlers();
      let response = await app.get(`changes/count?since=${since}&appVersion=0.0.1`);
      expect(response.body.changeCount).to.equal(1);

      response = await app.get(`changes/count?since=${since}&appVersion=1.6.69`);
      expect(response.body.changeCount).to.equal(2);

      response = await app.get(`changes/count?since=${since}&appVersion=1.7.102`);
      expect(response.body.changeCount).to.equal(3);
    });
  });

  describe('GET /changes/ - entity question config', async () => {
    const nonLegacyConfig = {
      entity: {
        createNew: true,
        fields: {
          name: {
            questionId: 'TESTID_123',
          },
        },
      },
    };

    it('should return the correct format for entity config in survey_screen_component based on legacy appVersion', async function () {
      const since = Date.now();
      // Wait one second for the triggers to have properly added the changes to the queue
      await oneSecondSleep();
      const questionId = generateId();
      await upsertQuestion({ id: questionId, type: 'Entity' });
      const { id: countryId } = await upsertCountry({ code: 'DL' });
      const survey = await upsertSurvey({ country_ids: [countryId] });
      const screen = await upsertSurveyScreen({ survey_id: survey.id });
      const component = await upsertSurveyScreenComponent({
        question_id: questionId,
        config: JSON.stringify(nonLegacyConfig),
        screen_id: screen.id,
      });

      await oneSecondSleep();
      // Wait for the triggers to have properly added the changes to the queue
      await models.database.waitForAllChangeHandlers();
      const responseForLegacyVersion = await app.get(`changes?since=${since}&appVersion=1.12.124`);

      // Find the component's change by id rather than a fixed array index — the
      // number/order of preceding changes is not stable.
      const change = responseForLegacyVersion.body.find(c => c.record?.id === component.id);
      expect(JSON.parse(change.record.config)).to.deep.equal({
        entity: {
          createNew: true,
          name: {
            questionId: 'TESTID_123',
          },
        },
      });
    });

    it('should return the non-legacy format for entity config in survey_screen_component based on compatible appVersion', async function () {
      const since = Date.now();
      // Wait one second for the triggers to have properly added the changes to the queue
      await oneSecondSleep();
      const questionId = generateId();
      await upsertQuestion({ id: questionId, type: 'Entity' });
      const { id: countryId } = await models.country.findOne({ code: 'DL' });
      const survey = await upsertSurvey({ country_ids: [countryId] });
      const screen = await upsertSurveyScreen({ survey_id: survey.id });
      const component = await upsertSurveyScreenComponent({
        question_id: questionId,
        config: JSON.stringify(nonLegacyConfig),
        screen_id: screen.id,
      });

      await oneSecondSleep();
      // Wait for the triggers to have properly added the changes to the queue
      await models.database.waitForAllChangeHandlers();
      const responseForLegacyVersion = await app.get(`changes?since=${since}&appVersion=1.13.129`);
      // Find the component's change by id rather than a fixed array index — the
      // number/order of preceding changes is not stable.
      const change = responseForLegacyVersion.body.find(c => c.record?.id === component.id);
      expect(JSON.parse(change.record.config)).to.deep.equal(nonLegacyConfig);
    });
  });

  describe('GET /changes/ - TUP-3067 entity hierarchy (canonical filter + robustness)', async () => {
    it('syncs only the canonical row per code, with project_id/bounds stripped and point kept', async () => {
      // Two entities share a code across projects. MediTrak must receive only
      // the canonical (lowest-id) row, with project_id & bounds stripped (per
      // ignorableFields) and point retained.
      const since = Date.now();
      await oneSecondSleep();
      await models.country.findOrCreate({ code: 'DL' }, { name: 'Demo Land' });
      const projectA = await upsertProject({ code: `cf_a_${Date.now()}` });
      const projectB = await upsertProject({ code: `cf_b_${Date.now()}` });
      const code = `cf_entity_${Date.now()}`;
      const point = JSON.stringify({ type: 'Point', coordinates: [178.4, -18.1] });
      const idA = generateId();
      const idB = generateId();
      // Same code in two projects, both with a point and a non-null project_id.
      await models.database.executeSql(
        `INSERT INTO entity (id, code, name, type, country_code, project_id, point)
         VALUES (?, ?, 'A', 'facility', 'DL', ?, ST_GeomFromGeoJSON(?));`,
        [idA, code, projectA.id, point],
      );
      await models.database.executeSql(
        `INSERT INTO entity (id, code, name, type, country_code, project_id, point)
         VALUES (?, ?, 'B', 'facility', 'DL', ?, ST_GeomFromGeoJSON(?));`,
        [idB, code, projectB.id, point],
      );
      await oneSecondSleep();
      await models.database.waitForAllChangeHandlers();

      const response = await app.get(`changes?since=${since}&recordTypes=entity&appVersion=1.11.0`);
      const forCode = response.body.filter(c => c.record?.code === code);
      const canonicalId = [idA, idB].sort()[0]; // MIN(id) is a lexicographic min on the text column

      expect(forCode, 'exactly one row per code').to.have.lengthOf(1);
      expect(forCode[0].record.id).to.equal(canonicalId);
      expect(forCode[0].record.project_id, 'project_id stripped').to.be.undefined;
      expect(forCode[0].record.bounds, 'bounds stripped').to.be.undefined;
      expect(forCode[0].record.point, 'point retained').to.exist;
    });

    it('sends a delete when a synced record no longer exists', async () => {
      // Simulate an orphaned "update" entry: a sync-queue row whose record was
      // deleted without a delete tombstone (as the epic's cascading deletes
      // left for survey / user_entity_permission). getChanges must emit it as a
      // delete, not a record-less update (which crashes the app).
      const since = Date.now();
      await oneSecondSleep();
      const goneId = generateId();
      await models.database.executeSql(
        `INSERT INTO meditrak_sync_queue (id, type, record_type, record_id, change_time)
         VALUES (?, 'update', 'survey', ?, ?);`,
        [generateId(), goneId, Date.now()],
      );
      // Raw queue insert doesn't fire the change handler, so refresh the view directly.
      await models.database.executeSql(
        'REFRESH MATERIALIZED VIEW permissions_based_meditrak_sync_queue;',
      );

      const response = await app.get(`changes?since=${since}&recordTypes=survey&appVersion=1.11.0`);
      const change = response.body.find(c => c.record?.id === goneId);
      expect(change, 'orphaned update is returned').to.exist;
      expect(change.action, 'sent as a delete').to.equal('delete');
      expect(change.error, 'no record-less error change').to.be.undefined;
    });
  });
});
