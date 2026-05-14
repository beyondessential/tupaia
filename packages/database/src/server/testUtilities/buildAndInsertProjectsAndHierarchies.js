import { findOrCreateDummyRecord } from './upsertDummyRecord';

const inferType = (entityProps, isDirectChildOfProject) => {
  if (entityProps.type !== undefined) return entityProps.type;
  if (entityProps.country_code === entityProps.code) return 'country';
  if (isDirectChildOfProject) return 'country';
  return undefined;
};

const STRUCTURAL_TYPES = new Set(['world', 'project', 'country']);

export const buildAndInsertProjectsAndHierarchies = async (models, projects) => {
  // Pass 1 — projects + project entities + entity hierarchies. These are 1:1 with the
  // input list and don't depend on each other.
  const createdProjects = projects.map(() => ({}));
  for (let i = 0; i < projects.length; i++) {
    const { code, ...projectProps } = projects[i];

    const projectEntity = await findOrCreateDummyRecord(
      models.entity,
      { code },
      {
        type: 'project',
        name: projectProps.projectEntityName,
        attributes: projectProps.projectEntityAttributes || {},
      },
    );

    const entityHierarchy = await findOrCreateDummyRecord(models.entityHierarchy, { name: code });

    const project = await findOrCreateDummyRecord(
      models.project,
      { code },
      { entity_id: projectEntity.id, entity_hierarchy_id: entityHierarchy.id, ...projectProps },
    );

    createdProjects[i] = { project, projectEntity, entityHierarchy };
  }

  // Pass 2 — entities. Tabulate which projects use each entity code so we can decide
  // shared-vs-duplicated upfront. Also pre-compute "is this entity a direct child of
  // its project's entity" so type inference can default such children to 'country'
  // (matches the pre-3065 reality that project entities only had country children).
  const projectsByEntityCode = new Map(); // code -> Set of project indices
  const directChildOfProject = new Set(); // codes that appear as a project's direct child
  for (let i = 0; i < projects.length; i++) {
    const projectCode = projects[i].code;
    for (const entityProps of projects[i].entities ?? []) {
      const code = entityProps.code;
      if (!projectsByEntityCode.has(code)) projectsByEntityCode.set(code, new Set());
      projectsByEntityCode.get(code).add(i);
    }
    const explicitRelations = projects[i].relations;
    if (explicitRelations) {
      for (const { parent, child } of explicitRelations) {
        if (parent === projectCode) directChildOfProject.add(child);
      }
    } else {
      // No relations supplied — buildAndInsertProjectAndHierarchy defaults all
      // entities to direct children of the project entity.
      for (const entityProps of projects[i].entities ?? []) {
        directChildOfProject.add(entityProps.code);
      }
    }
  }

  // entityByProjectAndCode[projectIndex][code] -> the EntityRecord that this project's
  // relations should resolve to. For structural entities the same row is returned for
  // every project; for sub-country entities each project gets its own row.
  const entityByProjectAndCode = projects.map(() => ({}));
  const allEntities = [];

  for (const [code, projectIndices] of projectsByEntityCode.entries()) {
    // Find the entity definition (any project's copy of `entities` will do — they
    // share the same fixture object).
    let entityProps;
    for (const i of projectIndices) {
      entityProps = (projects[i].entities ?? []).find(e => e.code === code);
      if (entityProps) break;
    }
    if (!entityProps) continue;

    const { code: entityCode, ...restOfEntity } = entityProps;
    const type = inferType(entityProps, directChildOfProject.has(entityCode));

    if (type !== undefined && STRUCTURAL_TYPES.has(type)) {
      // Shared structural row. project_id stays NULL.
      const entity = await findOrCreateDummyRecord(
        models.entity,
        { code: entityCode },
        { ...restOfEntity, type, project_id: null },
      );
      allEntities.push(entity);
      for (const i of projectIndices) entityByProjectAndCode[i][entityCode] = entity;
    } else {
      // Sub-country: one row per project. Find-by `(code, project_id)` so re-running
      // setup on the same fixture is idempotent.
      for (const i of projectIndices) {
        const project = createdProjects[i].project;
        const entity = await findOrCreateDummyRecord(
          models.entity,
          { code: entityCode, project_id: project.id },
          { ...restOfEntity, ...(type !== undefined ? { type } : {}), project_id: project.id },
        );
        allEntities.push(entity);
        entityByProjectAndCode[i][entityCode] = entity;
      }
    }
  }

  // Pass 3 — relations. Each project's relations reference entities by code; resolve
  // through this project's entityByCode map so duplicates land in the right project.
  for (let i = 0; i < projects.length; i++) {
    const { entities: entitiesProps = [], relations: relationProps } = projects[i];
    const { project, projectEntity } = createdProjects[i];
    const byCode = entityByProjectAndCode[i];
    byCode[projectEntity.code] = projectEntity;

    const projectScopedEntities = entitiesProps
      .map(({ code }) => byCode[code])
      .filter(Boolean);

    const relations =
      relationProps ||
      projectScopedEntities.map(entity => ({ parent: projectEntity.code, child: entity.code }));

    const entityRelations = [];
    for (const { parent, child } of relations) {
      const parentEntity = byCode[parent];
      const childEntity = byCode[child];
      if (!parentEntity || !childEntity) continue;

      if (parentEntity.type === 'project' && childEntity.type === 'country') {
        await findOrCreateDummyRecord(models.projectCountry, {
          project_id: project.id,
          country_id: childEntity.id,
        });
      } else {
        await models.entity.updateById(childEntity.id, { parent_id: parentEntity.id });
      }

      // Also write the legacy entity_relation row. Central-server permission
      // consumers (createDashboardRelationsDBFilter, assertMapOverlaysPermissions,
      // GETProjects, viz-builder utilities) still read `entity_relation` until
      // PR3 (#6778) switches them to `project_country`. Until then, fixtures need
      // both. PR3 will drop this write.
      const entityRelation = await findOrCreateDummyRecord(models.entityRelation, {
        parent_id: parentEntity.id,
        child_id: childEntity.id,
        entity_hierarchy_id: createdProjects[i].entityHierarchy.id,
      });
      entityRelations.push(entityRelation);
    }

    createdProjects[i].entities = projectScopedEntities;
    createdProjects[i].entityRelations = entityRelations;
  }

  return createdProjects;
};
