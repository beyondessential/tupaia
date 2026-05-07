import { findOrCreateDummyRecord } from './upsertDummyRecord';

// Type-inference shorthand for fixtures that say `{ code: 'KI', country_code: 'KI' }`
// without an explicit `type`. Pre-3065 the type was incidental (hierarchy was via
// entity_relation); now it determines whether a project relation routes into
// project_country or parent_id.
const inferType = entityProps => {
  if (entityProps.type !== undefined) return entityProps.type;
  if (entityProps.country_code === entityProps.code) return 'country';
  return undefined;
};

const STRUCTURAL_TYPES = new Set(['world', 'project', 'country']);

/**
 * TUP-3065 / TUP-3060:
 *
 * Hierarchy edges live on `entity.parent_id`. Project ↔ country edges live in the
 * `project_country` join table. Sub-country entities (district, facility, individual,
 * etc.) belong to exactly one project, so when a fixture lists the same sub-country
 * entity under multiple projects, this helper inserts one row per project with the
 * same code but distinct ids — mirroring the production duplication done by
 * RN-1853's data migration.
 *
 * Structural entities (world / project / country) are shared: a single row with
 * NULL project_id is reused across every project that references them. The
 * project↔country mapping for those is recorded in `project_country`.
 *
 * The legacy `entity_relation` rows are not written. The returned `entityRelations`
 * array is left empty for back-compat.
 */
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
  // shared-vs-duplicated upfront.
  const projectsByEntityCode = new Map(); // code -> Set of project indices
  for (let i = 0; i < projects.length; i++) {
    for (const entityProps of projects[i].entities ?? []) {
      const code = entityProps.code;
      if (!projectsByEntityCode.has(code)) projectsByEntityCode.set(code, new Set());
      projectsByEntityCode.get(code).add(i);
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
    const type = inferType(entityProps);

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
    }

    createdProjects[i].entities = projectScopedEntities;
    createdProjects[i].entityRelations = [];
  }

  return createdProjects;
};
