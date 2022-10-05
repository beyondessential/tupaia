/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

// This is a copy of packages/report-server/src/reportBuilder/configValidator.ts
// TODO make DRY: https://linear.app/bes/issue/PHX-108/make-report-validation-dry

const customReportConfigValidator = yup.object().shape({
  customReport: yup.string().required(),
});

export const standardConfigValidator = yup.object().shape({
  transform: yup.array().required(),
  output: yup.object(),
});

// TODO: Consolidate this and the validator in @tupaia/report-server in a common @tupaia/types package
export const configValidator = yup.lazy<
  typeof standardConfigValidator | typeof customReportConfigValidator
>((config: unknown) => {
  if (typeof config === 'object' && config && 'customReport' in config) {
    return customReportConfigValidator;
  }

  return standardConfigValidator;
});
