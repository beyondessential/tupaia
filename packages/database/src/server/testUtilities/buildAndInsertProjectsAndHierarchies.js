import { findOrCreateDummyRecord } from './upsertDummyRecord';

// TUP-3065: hierarchy edges are now stored on `entity.parent_id` directly. Project ↔
// country edges live in the `project_country` join table. The legacy `entity_relation`
// rows aren't written by this helper anymore — but the return shape still includes a
// (now empty) `entityRelations` array to keep callers happy until they migrate.
const buildAndInsertProjectAndHierarchy = async (
  models,
  { entities: entitiesProps = [], relations: relationProps, code, ...projectProps },
) => {
  const entityByCode = {};
  const projectEntity = await findOrCreateDummyRecord(
    models.entity,
    { code },
    {
      type: 'project',
      name: projectProps.projectEntityName,
      attributes: projectProps.projectEntityAttributes || {},
    },
  );
  entityByCode[projectEntity.code] = projectEntity;

  const entityHierarchy = await findOrCreateDummyRecord(models.entityHierarchy, { name: code });
  const project = await findOrCreateDummyRecord(
    models.project,
    { code },
    { entity_id: projectEntity.id, entity_hierarchy_id: entityHierarchy.id, ...projectProps },
  );

  const entities = [];
  const processEntity = async entityProps => {
    const { code: entityCode, ...restOfEntity } = entityProps;
    // TUP-3065: many existing fixtures use the shorthand `{ code: 'KI', country_code: 'KI' }`
    // to mean "the Kiribati country entity" without setting `type: 'country'` explicitly.
    // Pre-3065 the type didn't matter (hierarchy was via entity_relation); now it does
    // (project relations route into project_country only when child.type === 'country').
    // Infer the country type from the country_code = code shorthand to keep those
    // fixtures working without a wholesale rewrite.
    const inferredType =
      restOfEntity.type === undefined && restOfEntity.country_code === entityCode
        ? 'country'
        : restOfEntity.type;
    const entity = await findOrCreateDummyRecord(
      models.entity,
      { code: entityCode },
      { ...restOfEntity, ...(inferredType !== undefined ? { type: inferredType } : {}) },
    );

    entities.push(entity);
    entityByCode[entity.code] = entity;
  };

  await Promise.all(entitiesProps.map(processEntity));

  const relations =
    relationProps || entities.map(entity => ({ parent: projectEntity.code, child: entity.code }));

  // Apply each relation as either a project_country row (project → country) or a
  // parent_id update on the child entity (canonical hierarchy edge).
  for (const { parent, child } of relations) {
    const parentEntity = entityByCode[parent];
    const childEntity = entityByCode[child];
    if (!parentEntity || !childEntity) continue;

    if (parentEntity.type === 'project' && childEntity.type === 'country') {
      await findOrCreateDummyRecord(models.projectCountry, {
        project_id: project.id,
        country_id: childEntity.id,
      });
    } else {
      await models.entity.updateById(childEntity.id, { parent_id: parentEntity.id });
    }
  }

  return { project, projectEntity, entityHierarchy, entityRelations: [], entities };
};

/**
 * Will create a project with the provided properties, along with the project entity, entity hierarchy and any child entities
 * Usage example:
 * ```js
 * await buildAndInsertProjectsAndHierarchies([
 *   {
 *     id: 'id',
 *     code: 'code',
 *     name: 'Project',
 *     entities: [
 *      { code: 'KI', type: 'country', country_code: 'Kiribati' },
 *      { code: 'VU', type: 'country', country_code: 'Vanuatu' },
 *      { code: 'VU_Malampa', type: 'district', country_code: 'Vanuatu' },
 *     ],
 *     relations: [
 *      {parent: 'code', child: 'KI' }
 *      {parent: 'code', child: 'VU' }
 *      {parent: 'VU', child: 'VU_Malampa' }
 *     ] (optional, if omitted all entities will be child of the project)
 *   },
 *   ..., // can handle more than one project
 * ]);
 * ```
 */
export const buildAndInsertProjectsAndHierarchies = async (models, projects) => {
  const createdProjects = [];

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const newCreatedProjects = await buildAndInsertProjectAndHierarchy(models, project);
    createdProjects.push(newCreatedProjects);
  }

  return createdProjects;
};
