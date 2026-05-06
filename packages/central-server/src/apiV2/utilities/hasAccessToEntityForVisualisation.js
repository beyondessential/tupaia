import { VIZ_BUILDER_PERMISSION_GROUP } from '../../permissions';

// TUP-3065: a project's countries used to be derived by walking the project entity's
// hierarchy via entity_relation. They now come from project_country directly. The
// `code` of the country entity is what the access policy treats as the country_code.
const getProjectCountryCodes = async (models, projectEntityCode) => {
  const project = await models.project.findOne({ code: projectEntityCode });
  if (!project) return [];
  const countries = await project.countries();
  return countries.map(country => country.code);
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
  const entity = await models.entity.findOne({ code: entityCode });
  return hasVizBuilderAccessToEntity(accessPolicy, models, entity);
};
