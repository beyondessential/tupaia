/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import {
  buildAndInsertSurvey,
  findOrCreateDummyCountryEntity,
  findOrCreateDummyRecord,
  generateId,
} from '@tupaia/database';
import { TestableApp, resetTestData } from '../../testUtilities';
import { BES_ADMIN_PERMISSION_GROUP } from '../../../permissions';

describe('Permissions checker for CreateTaskComment', async () => {
  const BES_ADMIN_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP],
  };

  const DEFAULT_POLICY = {
    DL: ['Donor'],
  };

  const PUBLIC_POLICY = {
    DL: ['Public'],
  };

  const app = new TestableApp();
  const { models } = app;

  const BASE_COMMENT = {
    message: 'This is a test comment',
    type: 'user',
  };

  const generateData = async () => {
    const { country: dlCountry } = await findOrCreateDummyCountryEntity(models, {
      code: 'DL',
      name: 'Demo Land',
    });

    const donorPermission = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Donor',
    });

    const facility = {
      id: generateId(),
      code: 'TEST_FACILITY_2',
      name: 'Test Facility 2',
      country_code: dlCountry.code,
    };

    await findOrCreateDummyRecord(models.entity, facility);

    const { survey } = await buildAndInsertSurvey(models, {
      code: 'TEST_SURVEY_1',
      name: 'Test Survey 1',
      permission_group_id: donorPermission.id,
      country_ids: [dlCountry.id],
    });

    const user = {
      id: generateId(),
      first_name: 'Minnie',
      last_name: 'Mouse',
    };

    await findOrCreateDummyRecord(models.user, user);

    const dueDate = new Date('2021-12-31');

    const task = {
      id: generateId(),
      survey_id: survey.id,
      entity_id: facility.id,
      due_date: dueDate,
      status: 'to_do',
      repeat_schedule: null,
    };

    await findOrCreateDummyRecord(
      models.task,
      {
        'task.id': task.id,
      },
      task,
    );

    return {
      task,
      user,
    };
  };

  let task;

  before(async () => {
    const data = await generateData();
    task = data.task;
  });

  afterEach(() => {
    app.revokeAccess();
  });

  after(async () => {
    await resetTestData();
  });

  describe('POST /taskComments', async () => {
    it('Sufficient permissions: allows a user to create a task comment if they have BES Admin permission', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.post(`tasks/${task.id}/taskComments`, {
        body: BASE_COMMENT,
      });

      expect(result.message).to.equal('Successfully created taskComments');
      const taskComment = await models.taskComment.findOne({
        task_id: task.id,
        message: BASE_COMMENT.message,
      });

      expect(taskComment).to.not.be.undefined;

      expect(taskComment.type).to.equal(BASE_COMMENT.type);
      expect(taskComment.user_name).to.equal('Test User');
      expect(taskComment.task_id).to.equal(task.id);
    });

    it('Sufficient permissions: allows a user to create a task comment if they have access to the task', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.post(`tasks/${task.id}/taskComments`, {
        body: BASE_COMMENT,
      });

      expect(result.message).to.equal('Successfully created taskComments');
      const taskComment = await models.taskComment.findOne({
        task_id: task.id,
        message: BASE_COMMENT.message,
      });

      expect(taskComment).to.not.be.undefined;

      expect(taskComment.type).to.equal(BASE_COMMENT.type);
      expect(taskComment.user_name).to.equal('Test User');
      expect(taskComment.task_id).to.equal(task.id);
    });

    it('Insufficient permissions: throws an error if the user does not have access to the task', async () => {
      await app.grantAccess(PUBLIC_POLICY);
      const { body: result } = await app.post(`tasks/${task.id}/taskComments`, {
        body: BASE_COMMENT,
      });

      expect(result).to.have.keys('error');
    });
  });
});
