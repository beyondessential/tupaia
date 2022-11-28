/**
 * Tupaia MediTrak
 * Copyright (c) 2022 Beyond Essential Systems Pty Ltd
 */

export const getCreateConfigs = (translate, { editEndpoint, fields }) => ({
  label: translate('admin.new'),
  actionConfig: {
    title: translate('admin.createNew'),
    editEndpoint,
    fields,
  },
});
