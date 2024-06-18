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

const rollbackRecordChange = async (models, records) => {
  await Promise.all(records.map(record => models.task.delete({ id: record.id })));
};

const createTasks = async (tasksToCreate, models) => {
  await Promise.all(tasksToCreate.map(task => findOrCreateDummyRecord(models.task, task)));
};

describe('Permissions checker for EditTask', async () => {
  const BES_ADMIN_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP],
    TO: [BES_ADMIN_PERMISSION_GROUP],
  };

  const DEFAULT_POLICY = {
    DL: ['Donor'],
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
        country_ids: [dlCountry.id],
      },
    ]);

    tasks = [
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

    await findOrCreateDummyRecord(models.user, assignee);
  });

  beforeEach(async () => {
    await createTasks(tasks, models);
  });

  afterEach(async () => {
    await rollbackRecordChange(models, tasks);
    app.revokeAccess();
  });

  after(async () => {
    await resetTestData();
  });

  describe('PUT /tasks/:id', async () => {
    it('Sufficient permissions: allows a user to edit a task if they have BES Admin permission', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      await app.put(`tasks/${tasks[1].id}`, {
        body: {
          entity_id: facilities[0].id,
          survey_id: surveys[0].survey.id,
        },
      });
      const result = await models.task.find({
        id: tasks[1].id,
      });
      expect(result[0].entity_id).to.equal(facilities[0].id);
      expect(result[0].survey_id).to.equal(surveys[0].survey.id);
    });

    it('Sufficient permissions: allows a user to edit a task if they have access to the task, and entity and survey are not being updated', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      await app.put(`tasks/${tasks[1].id}`, {
        body: {
          status: 'completed',
        },
      });
      const result = await models.task.find({
        id: tasks[1].id,
      });
      expect(result[0].status).to.equal('completed');
    });

    it('Sufficient permissions: allows a user to edit a task if they have access to the task, and the entity and survey that are being linked to the task', async () => {
      await app.grantAccess({
        DL: ['Donor'],
        TO: ['Donor'],
      });
      await app.put(`tasks/${tasks[1].id}`, {
        body: {
          survey_id: surveys[1].survey.id,
          entity_id: facilities[1].id,
        },
      });
      const result = await models.task.find({
        id: tasks[1].id,
      });
      expect(result[0].entity_id).to.equal(facilities[1].id);
      expect(result[0].survey_id).to.equal(surveys[1].survey.id);
    });

    it('Insufficient permissions: throws an error if the user does not have access to the task being edited', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.put(`tasks/${tasks[0].id}`, {
        body: {
          status: 'completed',
        },
      });
      expect(result).to.have.keys('error');
      expect(result.error).to.include('Need to have access to the country of the task');
    });

    it('Insufficient permissions: throws an error if the user does not have access to the survey being linked to the task', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.put(`tasks/${tasks[1].id}`, {
        body: {
          survey_id: surveys[0].survey.id,
        },
      });
      expect(result).to.have.keys('error');
      expect(result.error).to.include('Need to have access to the new survey of the task');
    });

    it('Insufficient permissions: throws an error if the user does not have access to the entity being linked to the task', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.put(`tasks/${tasks[1].id}`, {
        body: {
          entity_id: facilities[0].id,
        },
      });
      expect(result).to.have.keys('error');
      expect(result.error).to.include('Need to have access to the new entity of the task');
    });
  });
});
