/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { findOrCreateDummyRecord } from './upsertDummyRecord';

const buildAndInsertEntityAndHierarchy = async (
  models,
  hierarchyId,
  projectEntityId,
  { code, ...entityProperties },
) => {
  const entity = await findOrCreateDummyRecord(models.entity, { code }, entityProperties);
  const entityRelation = await findOrCreateDummyRecord(models.entityRelation, {
    parent_id: projectEntityId,
    child_id: entity.id,
    entity_hierarchy_id: hierarchyId,
  });
  return { entity, entityRelation };
};

const buildAndInsertProjectAndHierarchy = async (
  models,
  { entities: entityProps = [], code, ...projectProps },
) => {
  const projectEntity = await findOrCreateDummyRecord(models.entity, { code, type: 'project' });
  const entityHierarchy = await findOrCreateDummyRecord(models.entityHierarchy, { name: code });
  const project = await findOrCreateDummyRecord(
    models.project,
    { code },
    { entity_id: projectEntity.id, entity_hierarchy_id: entityHierarchy.id, ...projectProps },
  );

  const entities = [];
  const entityRelations = [];
  const processEntity = async e => {
    const { entity, entityRelation } = await buildAndInsertEntityAndHierarchy(
      models,
      entityHierarchy.id,
      projectEntity.id,
      e,
    );

    entities.push(entity);
    entityRelations.push(entityRelation);
  };
  await Promise.all(entityProps.map(processEntity));

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
 *     ],
 *   },
 *   ..., // can handle more than one project
 * ]);
 * ```
 */
export const buildAndInsertProjectsAndHierarchies = async (models, projects) => {
  const createdModels = [];
  await Promise.all(
    projects.map(async survey => {
      const newCreatedModels = await buildAndInsertProjectAndHierarchy(models, survey);
      createdModels.push(newCreatedModels);
    }),
  );

  return createdModels;
};
