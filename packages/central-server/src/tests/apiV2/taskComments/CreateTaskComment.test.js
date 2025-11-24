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
import { RRULE_FREQUENCIES } from '@tupaia/utils';

describe('Permissions checker for CreateTaskComment', async () => {
  const BES_ADMIN_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP],
  };

  const DEFAULT_POLICY = {
    DL: ['Donor'],
    TO: ['Donor'],
  };

  const app = new TestableApp();
  const { models } = app;
  let tasks;

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

    const facilities = [
      {
        id: generateId(),
        code: 'TEST_FACILITY_1',
        name: 'Test Facility 1',
        country_code: tongaCountry.code,
      },
      {
        id: generateId(),
        code: 'TEST_FACILITY_2',
        name: 'Test Facility 2',
        country_code: dlCountry.code,
      },
    ];

    await Promise.all(facilities.map(facility => findOrCreateDummyRecord(models.entity, facility)));

    const surveys = await buildAndInsertSurveys(models, [
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
        country_ids: [tongaCountry.id, dlCountry.id],
      },
    ]);

    const assignee = {
      id: generateId(),
      first_name: 'Minnie',
      last_name: 'Mouse',
    };
    await findOrCreateDummyRecord(models.user, assignee);

    const dueDate = new Date('2021-12-31').getTime();

    tasks = [
      {
        id: generateId(),
        survey_id: surveys[0].survey.id,
        entity_id: facilities[0].id,
        due_date: dueDate,
        status: 'to_do',
        repeat_schedule: null,
      },
      {
        id: generateId(),
        survey_id: surveys[1].survey.id,
        entity_id: facilities[1].id,
        assignee_id: assignee.id,
        due_date: null,
        repeat_schedule: {
          freq: RRULE_FREQUENCIES.DAILY,
        },
        status: null,
      },
    ];

    await Promise.all(
      tasks.map(task =>
        findOrCreateDummyRecord(
          models.task,
          {
            'task.id': task.id,
          },
          task,
        ),
      ),
    );
  });

  afterEach(async () => {
    await models.taskComment.delete({ task_id: tasks[0].id });
    await models.taskComment.delete({ task_id: tasks[1].id });
    app.revokeAccess();
  });

  after(async () => {
    await resetTestData();
  });

  describe('POST /tasks/:id/taskComments', async () => {
    it('Sufficient permissions: Successfully creates a task comment when the user has BES Admin permissions', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      await app.post(`tasks/${tasks[0].id}/taskComments`, {
        body: {
          message: 'This is a test comment',
          type: 'user',
        },
      });
      const comment = await models.taskComment.findOne({ task_id: tasks[0].id });
      expect(comment.message).to.equal('This is a test comment');
    });

    it('Sufficient permissions: Successfully creates a task comment when user has access to the task', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      await app.post(`tasks/${tasks[1].id}/taskComments`, {
        body: {
          message: 'This is a test comment',
          type: 'user',
        },
      });
      const comment = await models.taskComment.findOne({ task_id: tasks[1].id });
      expect(comment.message).to.equal('This is a test comment');
    });

    it('Insufficient permissions: throws an error if trying to create a comment for a task the user does not have permissions for', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.post(`tasks/${tasks[0].id}/taskComments`, {
        body: {
          message: 'This is a test comment',
          type: 'user',
        },
      });

      expect(result).to.have.keys('error');
    });
  });
});
