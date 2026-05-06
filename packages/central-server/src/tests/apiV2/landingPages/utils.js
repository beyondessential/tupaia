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

  const PROJECT_ENTITY_HIERARCHIES = PROJECT_ENTITIES.map(project => ({
    id: generateId(),
    name: project.code,
    canonical_types: '{country}',
  }));

  const TEST_PROJECTS = PROJECT_ENTITIES.map((project, index) => ({
    id: generateId(),
    permission_groups: '{Public}',
    code: project.code,
    entity_id: project.id,
    entity_hierarchy_id: PROJECT_ENTITY_HIERARCHIES[index].id,
  }));
  const DL = await findOrCreateDummyCountryEntity(models, { code: 'DL' });
  // TUP-3065: project↔country links via project_country, keyed on project.id.
  const PROJECT_COUNTRIES = TEST_PROJECTS.map(project => ({
    project_id: project.id,
    country_id: DL.entity.id,
  }));
  await findOrCreateRecords(models, {
    entity: PROJECT_ENTITIES,
    entityHierarchy: PROJECT_ENTITY_HIERARCHIES,
    project: TEST_PROJECTS,
    projectCountry: PROJECT_COUNTRIES,
  });
};
