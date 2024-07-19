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

describe('Permissions checker for CreateTaskComment', async () => {
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

  const user = {
    id: generateId(),
    first_name: 'Minnie',
    last_name: 'Mouse',
  };

  const BASE_COMMENT = {
    message: 'This is a test comment',
    type: 'user',
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

  afterEach(() => {
    app.revokeAccess();
  });

  after(async () => {
    await resetTestData();
  });

  describe('POST /taskComments', async () => {
    it('Sufficient permissions: allows a user to create a task comment if they have BES Admin permission', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.post('taskComments', {
        body: {
          ...BASE_COMMENT,
          task_id: tasks[0].id,
        },
      });

      expect(result.message).to.equal('Successfully created task comments');
    });
  });
});
