import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions';

export const hasTupaiaAdminAccessToEntityForVisualisation = async (
  accessPolicy,
  models,
  entity,
) => {
  if (entity.isProject()) {
    // TUP-3065: project countries from project_country, country_code === country.code.
    const project = await models.project.findOne({ code: entity.code });
    if (!project) return false;
    const countries = await project.countries();
    return accessPolicy.allowsAll(
      countries.map(c => c.code),
      TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
    );
  }

  return accessPolicy.allows(entity.country_code, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP);
};
