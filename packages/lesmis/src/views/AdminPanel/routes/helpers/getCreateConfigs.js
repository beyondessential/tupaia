export const getCreateConfigs = (translate, { actionConfig, ...restOfConfigs }) => ({
  label: translate('admin.new'),
  ...restOfConfigs,
  actionConfig: {
    title: translate('admin.createNew'),
    ...actionConfig,
  },
});
