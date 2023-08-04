/**
 * Tupaia MediTrak
 * Copyright (c) 2022 Beyond Essential Systems Pty Ltd
 */

export const getDeleteColumnConfigs = (endpoint, translate) => ({
  Header: translate('admin.delete'),
  source: 'id',
  type: 'delete',
  actionConfig: {
    endpoint,
    confirmMessage: translate('admin.areYouSureYouWantToDeleteThisRecord'),
  },
});
