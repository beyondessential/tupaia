import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import {
  buildAndInsertSurveys,
  findOrCreateDummyCountryEntity,
  findOrCreateDummyRecord,
  generateId,
} from '@tupaia/database';
import { RRULE_FREQUENCIES } from '@tupaia/utils';
import { TestableApp, resetTestData } from '../../testUtilities';
import { BES_ADMIN_PERMISSION_GROUP } from '../../../permissions';

describe('Permissions checker for GETTasks', async () => {
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
      {
        id: generateId(),
        survey_id: surveys[1].survey.id,
        entity_id: facilities[0].id,
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

  afterEach(() => {
    app.revokeAccess();
  });

  after(async () => {
    await resetTestData();
  });

  describe('GET /tasks/:id', async () => {
    it('Sufficient permissions: returns a requested task when user has BES admin permissions', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.get(`tasks/${tasks[0].id}`);
      expect(result.id).to.equal(tasks[0].id);
    });

    it('Sufficient permissions: returns a requested task when user has permissions', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`tasks/${tasks[1].id}`);

      expect(result.id).to.equal(tasks[1].id);
    });

    it('Insufficient permissions: throws an error if requesting task when user does not have permissions', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`tasks/${tasks[0].id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /tasks', async () => {
    it('Sufficient permissions: returns all tasks if the user has BES admin access', async () => {
      const columnsString = JSON.stringify([
        'id',
        'task_status',
        'assignee_name',
        'due_date',
        'repeat_schedule',
      ]);
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`tasks?columns=${columnsString}`);
      expect(results.length).to.equal(tasks.length);

      results.forEach((result, index) => {
        const task = tasks[index];
        expect(result.id).to.equal(task.id);
        if (task.assignee_id) {
          expect(result.assignee_name).to.equal('Minnie Mouse');
        }
        if (task.status === 'to_do') {
          expect(result.task_status).to.equal('overdue');
        } else expect(result.task_status).to.equal('repeating');
      });
    });

    it('Sufficient permissions: returns tasks when user has permissions', async () => {
      const columnsString = JSON.stringify(['assignee_name', 'id']);
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`tasks?columns=${columnsString}`);

      expect(results.length).to.equal(1);
      expect(results[0].assignee_name).to.equal('Minnie Mouse');
      expect(results[0].id).to.equal(tasks[1].id);
    });

    it('Insufficient permissions: returns an empty array if users do not have access to any tasks', async () => {
      await app.grantAccess(PUBLIC_POLICY);
      const { body: results } = await app.get('tasks');

      expect(results).to.be.empty;
    });
  });
});
