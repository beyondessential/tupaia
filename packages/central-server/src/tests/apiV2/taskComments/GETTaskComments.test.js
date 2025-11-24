import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import {
  buildAndInsertSurvey,
  findOrCreateDummyCountryEntity,
  findOrCreateDummyRecord,
  generateId,
} from '@tupaia/database';
import { TestableApp, resetTestData } from '../../testUtilities';
import { BES_ADMIN_PERMISSION_GROUP } from '../../../permissions';

describe('Permissions checker for GETTaskComments', async () => {
  const BES_ADMIN_POLICY = {
    TO: [BES_ADMIN_PERMISSION_GROUP],
  };

  const DEFAULT_POLICY = {
    TO: ['Donor'],
  };

  const PUBLIC_POLICY = {
    TO: ['Public'],
  };

  const app = new TestableApp();
  const { models } = app;

  const generateData = async () => {
    const { country: tongaCountry } = await findOrCreateDummyCountryEntity(models, {
      code: 'TO',
      name: 'Tonga',
    });

    const donorPermission = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Donor',
    });

    const facility = {
      id: generateId(),
      code: 'TEST_FACILITY_1',
      name: 'Test Facility 1',
      country_code: tongaCountry.code,
    };

    await findOrCreateDummyRecord(models.entity, facility);

    const { survey } = await buildAndInsertSurvey(models, {
      code: 'TEST_SURVEY_1',
      name: 'Test Survey 1',
      permission_group_id: donorPermission.id,
      country_ids: [tongaCountry.id],
    });

    const user = {
      id: generateId(),
      first_name: 'Minnie',
      last_name: 'Mouse',
    };
    await findOrCreateDummyRecord(models.user, user);

    const dueDate = new Date('2021-12-31').getTime();

    const task = {
      id: generateId(),
      survey_id: survey.id,
      entity_id: facility.id,
      due_date: dueDate,
      status: 'to_do',
      repeat_schedule: null,
    };

    const comment = {
      id: generateId(),
      task_id: task.id,
      user_id: user.id,
      user_name: 'Minnie Mouse',
      type: 'user',
      message: 'Comment 1',
      created_at: new Date('2021-01-01'),
    };

    await findOrCreateDummyRecord(
      models.task,
      {
        'task.id': task.id,
      },
      task,
    );

    await findOrCreateDummyRecord(
      models.taskComment,
      {
        'task_comment.id': comment.id,
      },
      comment,
    );
    return {
      task,
      user,
      comment,
    };
  };

  let task;
  let comment;

  before(async () => {
    const { task: createdTask, comment: createdComment } = await generateData();
    task = createdTask;
    comment = createdComment;
  });

  afterEach(() => {
    app.revokeAccess();
  });

  after(async () => {
    await resetTestData();
  });

  describe('GET /tasks/:parentRecordId/taskComments', async () => {
    it('Sufficient permissions: returns comments if the user has BES admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`tasks/${task.id}/taskComments`);
      expect(results.length).to.equal(1);

      expect(results[0].id).to.equal(comment.id);
    });

    it('Sufficient permissions: returns comments for the task if user has access to it', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`tasks/${task.id}/taskComments`);

      expect(results.length).to.equal(1);
      expect(results[0].id).to.equal(comment.id);
    });

    it('Insufficient permissions: throws an error if the user does not have access to the task', async () => {
      await app.grantAccess(PUBLIC_POLICY);
      const { body: results } = await app.get(`tasks/${task.id}/taskComments`);

      expect(results).to.have.keys('error');
    });
  });
});
