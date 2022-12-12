/**
 * Tupaia MediTrak
 * Copyright (c) 2022 Beyond Essential Systems Pty Ltd
 */

const getImportModalText = translate => ({
  title: translate('admin.import'),
  confirmButtonText: translate('admin.import'),
  cancelButtonText: translate('admin.cancel'),
  uploadButtonText: translate('admin.chooseFile'),
  noFileMessage: translate('admin.noFileChosen'),
});

export const getImportConfigs = (translate, importConfigs) => ({
  ...getImportModalText(translate),
  ...importConfigs,
});
