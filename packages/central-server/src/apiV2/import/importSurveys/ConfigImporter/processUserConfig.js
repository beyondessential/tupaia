/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

const translatePermissionGroup = async (config, models) => {
  const { permissionGroup } = config;
  const actualPermissionGroup = await models.permissionGroup.findOne({ name: permissionGroup });
  if (!actualPermissionGroup) {
    throw new Error(`Permission group ${permissionGroup} not found`);
  }

  return {
    ...config,
    permissionGroup: actualPermissionGroup.id,
  };
};

export const processUserConfig = async (models, config) => {
  const translatedConfig = await translatePermissionGroup(config, models);
  return translatedConfig;
};
