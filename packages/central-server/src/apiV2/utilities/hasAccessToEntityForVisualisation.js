import { VIZ_BUILDER_PERMISSION_GROUP } from '../../permissions';

const getProjectCountryCodes = async (models, projectEntityCode) => {
  const project = await models.project.findOne({ code: projectEntityCode });
  if (!project) return [];
  const countries = await project.countries();
  return countries.map(country => country.code);
};

// A project code no longer resolves to a stored entity. Fall back to the project's
// synthesized root so visualisation/dashboard permission checks keyed on a code
// (e.g. a dashboard's root_entity_code) keep working for project-level roots.
export const resolveEntityOrProjectRoot = async (models, code) => {
  const entity = await models.entity.findOneByCodeInProject(code, null);
  if (entity) return entity;
  const project = await models.project.findOne({ code });
  return project ? project.getRootEntity() : undefined;
};

export const hasAccessToEntityForVisualisation = async (
  accessPolicy,
  models,
  entity,
  permissionGroup,
) => {
  if (entity.isProject()) {
    const countryCodes = await getProjectCountryCodes(models, entity.code);
    return accessPolicy.allowsSome(countryCodes, permissionGroup);
  }

  return accessPolicy.allows(entity.country_code, permissionGroup);
};

/**
 * Check user has permission to ALL given entities,as well as Viz Builder Access to ALL given entities
 */
export const hasVizBuilderAccessToEntity = async (accessPolicy, models, entity) => {
  // If entity is a project, check if user has access to all countries in the project
  if (entity.isProject()) {
    const countryCodes = await getProjectCountryCodes(models, entity.code);
    return accessPolicy.allowsAll(countryCodes, VIZ_BUILDER_PERMISSION_GROUP);
  }

  return accessPolicy.allows(entity.country_code, VIZ_BUILDER_PERMISSION_GROUP);
};

export const hasVizBuilderAccessToEntityCode = async (accessPolicy, models, entityCode) => {
  const entity = await resolveEntityOrProjectRoot(models, entityCode);
  if (!entity) return false;
  return hasVizBuilderAccessToEntity(accessPolicy, models, entity);
};
