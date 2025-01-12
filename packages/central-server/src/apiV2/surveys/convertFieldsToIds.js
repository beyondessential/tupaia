/**
 *  See SurveysPage comments regarding RN-910
 */
export const convertFieldsToIds = async (models, fields) => {
  const {
    countryNames,
    'permission_group.name': permissionGroupName,
    'project.code': projectCode,
  } = fields;

  const updatedFields = { ...fields };

  if (countryNames) {
    const countries = await models.country.find({ name: countryNames });
    if (countryNames.length !== countries.length) {
      throw new Error('One or more provided countries do not exist');
    }
    updatedFields.country_ids = countries.map(country => country.id);
  }
  if (permissionGroupName !== undefined) {
    if (permissionGroupName === null) {
      updatedFields.permission_group_id = null;
    } else {
      const permissionGroup = await models.permissionGroup.findOne({ name: permissionGroupName });
      if (!permissionGroup) {
        throw new Error('Permission Group not found');
      }
      updatedFields.permission_group_id = permissionGroup.id;
    }
  }

  if (projectCode !== undefined) {
    if (projectCode === null) {
      updatedFields.project_id = null;
    } else {
      const project = await models.project.findOne({ code: projectCode });
      if (!project) {
        throw new Error('Project not found');
      }
      updatedFields.project_id = project.id;
    }
  }

  return updatedFields;
};
