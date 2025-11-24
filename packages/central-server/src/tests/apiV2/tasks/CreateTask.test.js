import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import {
  buildAndInsertSurveys,
  findOrCreateDummyCountryEntity,
  findOrCreateDummyRecord,
  generateId,
} from '@tupaia/database';
import { TestableApp, resetTestData } from '../../testUtilities';
import { BES_ADMIN_PERMISSION_GROUP } from '../../../permissions';

describe('Permissions checker for CreateTask', async () => {
  const BES_ADMIN_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP],
  };

  const DEFAULT_POLICY = {
    TO: ['Donor'],
  };

  const app = new TestableApp();
  const { models } = app;
  let surveys;
  const facilities = [
    {
      id: generateId(),
      code: 'TEST_FACILITY_1',
      name: 'Test Facility 1',
      country_code: 'TO',
    },
    {
      id: generateId(),
      code: 'TEST_FACILITY_2',
      name: 'Test Facility 2',
      country_code: 'DL',
    },
  ];
  const assignee = {
    id: generateId(),
    first_name: 'Peter',
    last_name: 'Pan',
  };

  const dueDate = new Date('2021-12-31').getTime();

  const BASE_TASK = {
    assignee_id: assignee.id,
    repeat_schedule: null,
    due_date: dueDate,
    status: 'to_do',
  };

  before(async () => {
    const { country: tongaCountry } = await findOrCreateDummyCountryEntity(models, {
      code: 'TO',
      name: 'Tonga',
    });

    const { country: dlCountry } = await findOrCreateDummyCountryEntity(models, {
      code: 'DL',
      name: 'Demo Land',
    });

    const donorPermission = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Donor',
    });
    const BESAdminPermission = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });

    await Promise.all(facilities.map(facility => findOrCreateDummyRecord(models.entity, facility)));

    surveys = await buildAndInsertSurveys(models, [
      {
        code: 'TEST_SURVEY_1',
        name: 'Test Survey 1',
        permission_group_id: BESAdminPermission.id,
        country_ids: [tongaCountry.id, dlCountry.id],
      },
      {
        code: 'TEST_SURVEY_2',
        name: 'Test Survey 2',
        permission_group_id: donorPermission.id,
        country_ids: [tongaCountry.id],
      },
    ]);

    await findOrCreateDummyRecord(models.user, assignee);
  });

  afterEach(() => {
    app.revokeAccess();
  });

  after(async () => {
    await resetTestData();
  });

  describe('POST /tasks', async () => {
    it('Sufficient permissions: allows a user to create a task if they have BES Admin permission', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.post('tasks', {
        body: {
          ...BASE_TASK,
          entity_id: facilities[0].id,
          survey_id: surveys[0].survey.id,
        },
      });

      expect(result.message).to.equal('Successfully created tasks');
    });

    it('Insufficient permissions: Does not allow user to create a task for an entity they do not have access to', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.post('tasks', {
        body: {
          ...BASE_TASK,
          entity_id: facilities[1].id,
          survey_id: surveys[1].survey.id,
        },
      });
      expect(result).to.have.keys('error');
    });

    it('Insufficient permissions: Does not allow user to create a task for a survey they do not have access to', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.post('tasks', {
        body: {
          ...BASE_TASK,
          entity_id: facilities[0].id,
          survey_id: surveys[0].survey.id,
        },
      });
      expect(result).to.have.keys('error');
    });

    it('Handles creating a task with a comment', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.post('tasks', {
        body: {
          ...BASE_TASK,
          entity_id: facilities[0].id,
          survey_id: surveys[0].survey.id,
          comment: 'This is a comment',
        },
      });

      expect(result.message).to.equal('Successfully created tasks');
      const comment = await models.taskComment.findOne({
        task_id: result.id,
        message: 'This is a comment',
      });
      expect(comment).not.to.be.undefined;
    });
  });
});
