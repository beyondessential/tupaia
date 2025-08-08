export const getDeleteColumnConfigs = (endpoint, translate) => ({
  Header: translate('admin.delete'),
  type: 'delete',
  actionConfig: {
    endpoint,
    confirmMessage: translate('admin.areYouSureYouWantToDeleteThisRecord'),
  },
});
