/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import {
  buildAndInsertSurveys,
  findOrCreateDummyCountryEntity,
  findOrCreateDummyRecord,
  generateId,
} from '@tupaia/database';
import { TestableApp, resetTestData } from '../../testUtilities';
import { BES_ADMIN_PERMISSION_GROUP } from '../../../permissions';

describe('Permissions checker for GETTaskComments', async () => {
  const BES_ADMIN_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP],
  };

  const DEFAULT_POLICY = {
    DL: ['Donor'],
    TO: ['Donor'],
  };

  const PUBLIC_POLICY = {
    DL: ['Public'],
  };

  const app = new TestableApp();
  const { models } = app;
  let tasks;
  let comments;

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

    const user = {
      id: generateId(),
      first_name: 'Minnie',
      last_name: 'Mouse',
    };
    await findOrCreateDummyRecord(models.user, user);

    const dueDate = new Date('2021-12-31');

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
        due_date: null,
        repeat_schedule: '{}',
        status: null,
      },
    ];

    comments = [
      {
        id: generateId(),
        task_id: tasks[0].id,
        user_id: user.id,
        user_name: 'Minnie Mouse',
        type: 'user',
        comment: 'Comment 1',
        created_at: new Date('2021-01-01'),
      },
      {
        id: generateId(),
        task_id: tasks[1].id,
        user_id: user.id,
        user_name: 'Minnie Mouse',
        type: 'user',
        comment: 'Comment 2',
        created_at: new Date('2021-01-02'),
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

    await Promise.all(
      comments.map(comment =>
        findOrCreateDummyRecord(
          models.taskComment,
          {
            'task_comment.id': comment.id,
          },
          comment,
        ),
      ),
    );
  });

  afterEach(() => {
    app.revokeAccess();
  });

  after(async () => {
    await resetTestData();
  });

  describe('GET /taskComments/:id', async () => {
    it('Sufficient permissions: returns a requested task comment when user has BES admin permissions', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.get(`taskComments/${comments[0].id}`);
      expect(result.id).to.equal(comments[0].id);
    });

    it('Sufficient permissions: returns a requested task comment when user has permissions', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`taskComments/${comments[1].id}`);

      expect(result.id).to.equal(comments[1].id);
    });

    it('Insufficient permissions: throws an error if requesting comment when user does not have permissions', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`taskComments/${comments[0].id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /taskComments', async () => {
    it('Sufficient permissions: returns all tasks if the user has BES admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get('taskComments');
      expect(results.length).to.equal(comments.length);

      results.forEach((result, index) => {
        const comment = comments[index];
        expect(result.id).to.equal(comment.id);
      });
    });

    it('Sufficient permissions: returns comments for tasks the user has access to', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get('taskComments');

      expect(results.length).to.equal(1);
      expect(results[0].id).to.equal(comments[1].id);
    });

    it('Sufficient permissions: handles filtering by task_id', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`taskComments?task_id=${tasks[0].id},${tasks[1].id}`);

      expect(results.length).to.equal(1);
      expect(results[0].id).to.equal(comments[1].id);
    });

    it('Insufficient permissions: returns an empty array if users do not have access to any tasks', async () => {
      await app.grantAccess(PUBLIC_POLICY);
      const { body: results } = await app.get('taskComments');

      expect(results).to.be.empty;
    });
  });
});
