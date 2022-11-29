/**
 * Tupaia MediTrak
 * Copyright (c) 2022 Beyond Essential Systems Pty Ltd
 */

export const getCreateConfigs = (translate, { actionConfig, ...restOfConfigs }) => ({
  label: translate('admin.new'),
  ...restOfConfigs,
  actionConfig: {
    title: translate('admin.createNew'),
    ...actionConfig,
  },
});
