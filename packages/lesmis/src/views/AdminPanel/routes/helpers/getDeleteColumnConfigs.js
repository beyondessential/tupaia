/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

export const getDeleteColumnConfigs = (endpoint, translate) => ({
  Header: translate('admin.delete'),
  type: 'delete',
  actionConfig: {
    endpoint,
    confirmMessage: translate('admin.areYouSureYouWantToDeleteThisRecord'),
  },
});
