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

describe('Permissions checker for EditTask', async () => {
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

  const dueDate = new Date('2021-12-31');

  const tasks = [
    {
      id: generateId(),
      survey_id: surveys[0].survey.id,
      entity_id: facilities[0].id,
      assignee_id: assignee.id,
      is_recurring: false,
      due_date: dueDate,
    },
    {
      id: generateId(),
      survey_id: surveys[1].survey.id,
      entity_id: facilities[1].id,
      assignee_id: assignee.id,
      is_recurring: false,
      due_date: dueDate,
    },
  ];

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

    await Promise.all(tasks.map(task => findOrCreateDummyRecord(models.task, task)));
  });

  afterEach(() => {
    app.revokeAccess();
  });

  after(async () => {
    await resetTestData();
  });

  describe('PUT /tasks/:id', async () => {
    it('Sufficient permissions: allows a user to edit a task if they have BES Admin permission', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      await app.put(`tasks/${tasks[0].id}`, {
        body: {
          entity_id: facilities[0].id,
          survey_id: surveys[0].survey.id,
        },
      });
    });
  });
});
