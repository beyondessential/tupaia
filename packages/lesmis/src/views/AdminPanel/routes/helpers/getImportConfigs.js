/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
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
