const getImportModalText = translate => ({
  title: translate('admin.import'),
  confirmButtonText: translate('admin.import'),
  cancelButtonText: translate('admin.cancel'),
  uploadButtonText: translate('admin.chooseFile'),
});

export const getImportConfigs = (translate, importConfigs) => ({
  ...getImportModalText(translate),
  ...importConfigs,
});
