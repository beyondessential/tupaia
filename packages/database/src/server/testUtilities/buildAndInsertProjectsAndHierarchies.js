import { findOrCreateDummyRecord } from './upsertDummyRecord';

const buildAndInsertProjectAndHierarchy = async (
  models,
  { entities: entitiesProps = [], relations: relationProps, code, ...projectProps },
) => {
  const entityCodeToId = {};
  const projectEntity = await findOrCreateDummyRecord(
    models.entity,
    { code },
    {
      type: 'project',
      name: projectProps.projectEntityName,
      attributes: projectProps.projectEntityAttributes || {},
    },
  );
  entityCodeToId[projectEntity.code] = projectEntity.id;

  const entityHierarchy = await findOrCreateDummyRecord(models.entityHierarchy, { name: code });
  const project = await findOrCreateDummyRecord(
    models.project,
    { code },
    { entity_id: projectEntity.id, entity_hierarchy_id: entityHierarchy.id, ...projectProps },
  );

  const entities = [];
  const entityRelations = [];
  const processEntity = async entityProps => {
    const { code: entityCode, ...restOfEntity } = entityProps;
    const entity = await findOrCreateDummyRecord(models.entity, { code: entityCode }, restOfEntity);

    entities.push(entity);
    entityCodeToId[entity.code] = entity.id;
  };

  const processEntityRelation = async entityRelationProps => {
    const { parent, child } = entityRelationProps;
    const relation = await findOrCreateDummyRecord(models.entityRelation, {
      parent_id: entityCodeToId[parent],
      child_id: entityCodeToId[child],
      entity_hierarchy_id: entityHierarchy.id,
    });

    entityRelations.push(relation);
  };

  await Promise.all(entitiesProps.map(processEntity));

  const relations =
    relationProps || entities.map(entity => ({ parent: projectEntity.code, child: entity.code }));
  await Promise.all(relations.map(processEntityRelation));

  return { project, projectEntity, entityHierarchy, entityRelations, entities };
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
