/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

const customReportConfigValidator = yup.object().shape({
  customReport: yup.string().required(),
});

export const standardConfigValidator = yup.object().shape({
  transform: yup.array().required(),
  output: yup.object(),
});

export const configValidator = yup.lazy<
  typeof standardConfigValidator | typeof customReportConfigValidator
>((config: unknown) => {
  if (typeof config === 'object' && config && 'customReport' in config) {
    return customReportConfigValidator;
  }

  return standardConfigValidator;
});
