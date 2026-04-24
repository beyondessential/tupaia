import {
  upsertDummyRecord,
  getTestModels,
  findOrCreateDummyRecord,
  findOrCreateDummyCountryEntity,
} from '../../server/testUtilities';
import { QUERY_CONJUNCTIONS } from '../../core/BaseDatabase';
import { generateId } from '../../core/utilities';

const resetTestData = async (models, tasks) => {
  await models.task.delete({ id: tasks.map(task => task.id) });
  await models.survey.delete({ code: ['PUBLIC_SURVEY', 'ADMIN_SURVEY'] });
  await models.entity.delete({ code: ['TC1', 'TC2', 'TF1', 'TF2', 'TEST_PROJECT'] });
  await models.country.delete({ code: ['TC1', 'TC2'] });
  await models.project.delete({ code: 'TEST_PROJECT' });
  await models.permissionGroup.delete({ name: ['Admin', 'Public'] });
};

describe('TaskModel', () => {
  const models = getTestModels();
  let tasks;

  beforeAll(async () => {
    const adminPermissionGroup = await upsertDummyRecord(models.permissionGroup, {
      name: 'Admin',
      parent_id: null,
    });

    const publicPermissionGroup = await upsertDummyRecord(models.permissionGroup, {
      name: 'Public',
      parent_id: adminPermissionGroup.id,
    });

    const projectEntity = await findOrCreateDummyRecord(models.entity, {
      code: 'TEST_PROJECT',
      type: 'project',
      name: 'Test Project',
    });

    const project = await upsertDummyRecord(models.project, {
      code: 'TEST_PROJECT',
      entity_id: projectEntity.id,
      permission_groups: [adminPermissionGroup.id, publicPermissionGroup.id],
    });

    const { entity: countryEntity1 } = await findOrCreateDummyCountryEntity(models, {
      code: 'TC1',
      name: 'Test Country 1',
      parent_id: projectEntity.id,
    });

    const { entity: countryEntity2 } = await findOrCreateDummyCountryEntity(models, {
      code: 'TC2',
      name: 'Test Country 2',
      parent_id: projectEntity.id,
    });

    const facilities = [
      {
        id: generateId(),
        code: 'TF1',
        name: 'TEST_FACILITY_1',
        parent_id: countryEntity1.id,
        country_code: countryEntity1.code,
      },
      {
        id: generateId(),
        code: 'TF2',
        name: 'TEST_FACILITY_2',
        parent_id: countryEntity2.id,
        country_code: countryEntity2.code,
      },
    ];

    await Promise.all(facilities.map(facility => upsertDummyRecord(models.entity, facility)));

    const SURVEYS = [
      {
        id: generateId(),
        code: 'PUBLIC_SURVEY',
        name: 'PUBLIC_SURVEY',
        project_id: project.id,
        permission_group_id: publicPermissionGroup.id,
        country_ids: [countryEntity1.id, countryEntity2.id],
      },
      {
        id: generateId(),
        code: 'ADMIN_SURVEY',
        name: 'ADMIN_SURVEY',
        project_id: project.id,
        permission_group_id: adminPermissionGroup.id,
        country_ids: [countryEntity1.id],
      },
    ];

    await Promise.all(SURVEYS.map(survey => upsertDummyRecord(models.survey, survey)));

    const dueDate = new Date('2020-01-01 00:00:00+00').getTime();

    const TASKS = [
      {
        id: generateId(),
        survey_id: SURVEYS[0].id,
        status: 'to_do',
        entity_id: facilities[0].id,
        due_date: dueDate,
      },
      {
        id: generateId(),
        survey_id: SURVEYS[1].id,
        status: 'to_do',
        entity_id: facilities[1].id,
        due_date: dueDate,
      },
      {
        id: generateId(),
        survey_id: SURVEYS[0].id,
        status: 'to_do',
        entity_id: facilities[1].id,
        due_date: dueDate,
      },
    ];

    tasks = await Promise.all(TASKS.map(task => upsertDummyRecord(models.task, task)));
  });

  afterAll(async () => {
    await resetTestData(models, tasks);
  });

  describe('createAccessPolicyQueryClause', () => {
    it('Should handle when user has access to only 1 country in a survey', async () => {
      const query = await models.task.createAccessPolicyQueryClause({
        Public: ['TC1'],
        getPermissionGroups: () => ['Public'],
        getEntitiesAllowed: () => ['TC1'],
      });
      const results = await models.task.find({
        [QUERY_CONJUNCTIONS.RAW]: query,
      });

      expect(results).toHaveLength(1);

      expect(results[0].id).toEqual(tasks[0].id);
    });

    it('Should handle when user has access to all countries in a survey', async () => {
      const query = await models.task.createAccessPolicyQueryClause({
        Public: ['TC1', 'TC2'],
        getPermissionGroups: () => ['Public'],
        getEntitiesAllowed: () => ['TC1', 'TC2'],
      });
      const results = await models.task.find({
        [QUERY_CONJUNCTIONS.RAW]: query,
      });

      expect(results).toHaveLength(2);
      const ids = results.map(r => r.id);
      expect(ids).toContain(tasks[0].id);
      expect(ids).toContain(tasks[2].id);
    });
  });

  describe('countTasksForAccessPolicy', () => {
    it('Should handle when user has access to only 1 country in a survey', async () => {
      const result = await models.task.countTasksForAccessPolicy(
        {
          Public: ['TC1'],
          getPermissionGroups: () => ['Public'],
          getEntitiesAllowed: () => ['TC1'],
          allowsSome: () => false,
        },
        {
          status: 'to_do',
        },
        {
          multiJoin: models.task.DatabaseRecordClass.joins,
        },
      );

      expect(result).toEqual(1);
    });

    it('Should handle when user has access to all countries in a survey', async () => {
      const result = await models.task.countTasksForAccessPolicy(
        {
          Public: ['TC1', 'TC2'],
          getPermissionGroups: () => ['Public'],
          getEntitiesAllowed: () => ['TC1', 'TC2'],
          allowsSome: () => false,
        },
        {
          status: 'to_do',
        },
        {
          multiJoin: models.task.DatabaseRecordClass.joins,
        },
      );

      expect(result).toEqual(2);
    });

    it('Should handle when user has BES admin access', async () => {
      const result = await models.task.countTasksForAccessPolicy(
        {
          Public: ['TC1', 'TC2'],
          getPermissionGroups: () => ['Public'],
          getEntitiesAllowed: () => ['TC1', 'TC2'],
          allowsSome: () => true,
        },
        {
          status: 'to_do',
        },
        {
          multiJoin: models.task.DatabaseRecordClass.joins,
        },
      );

      expect(result).toEqual(3);
    });
  });
});
