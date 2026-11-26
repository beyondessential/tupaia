import { findOrCreateDummyCountryEntity, findOrCreateRecords, generateId } from '@tupaia/database';

export const setupProject = async models => {
  const PROJECT_ENTITIES = [
    {
      id: generateId(),
      code: 'test_project1',
      type: 'project',
    },
    {
      id: generateId(),
      code: 'test_project2',
      type: 'project',
    },
  ];

  const TEST_PROJECTS = PROJECT_ENTITIES.map(project => ({
    id: generateId(),
    permission_groups: '{Public}',
    code: project.code,
    entity_id: project.id,
  }));
  const DL = await findOrCreateDummyCountryEntity(models, { code: 'DL' });
  const PROJECT_COUNTRIES = TEST_PROJECTS.map(project => ({
    project_id: project.id,
    country_id: DL.entity.id,
  }));
  await findOrCreateRecords(models, {
    entity: PROJECT_ENTITIES,
    project: TEST_PROJECTS,
    projectCountry: PROJECT_COUNTRIES,
  });
};
