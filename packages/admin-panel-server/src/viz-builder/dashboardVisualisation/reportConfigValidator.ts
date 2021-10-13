/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup, yupUtils } from '@tupaia/utils';

// This is a copy of packages/report-server/src/reportBuilder/configValidator.ts
// TODO make DRY: https://linear.app/bes/issue/PHX-108/make-report-validation-dry

const { polymorphic } = yupUtils;

const periodTypeValidator = yup.mixed().oneOf(['day', 'week', 'month', 'quarter', 'year']);

const createDataSourceValidator = (sourceType: 'dataElement' | 'dataGroup') => {
  const otherSourceKey = sourceType === 'dataElement' ? 'dataGroups' : 'dataElements';

  return yup
    .array()
    .of(yup.string().required())
    .when(['$testData', otherSourceKey], {
      is: ($testData: unknown, otherDataSource: string[]) =>
        !$testData && (!otherDataSource || otherDataSource.length === 0),
      then: yup
        .array()
        .of(yup.string().required())
        .required('Requires "dataGroups" or "dataElements"')
        .min(1),
    });
};

const dataElementValidator = createDataSourceValidator('dataElement');
const dataGroupValidator = createDataSourceValidator('dataGroup');

const aggregationValidator = polymorphic({
  string: yup.string().min(1),
  object: yup.object().shape({
    type: yup.string().min(1).required(),
    config: yup.object(),
  }),
});

const dateSpecsValidator = polymorphic({
  object: yup
    .object()
    .shape({
      unit: periodTypeValidator.required(),
      offset: yup.number(),
      modifier: yup.mixed().oneOf(['start_of', 'end_of']),
      modifierUnit: periodTypeValidator,
    })
    .default(undefined),
  string: yup.string().min(4),
});

export const configValidator = yup.object().shape({
  fetch: yup.object().shape(
    {
      dataElements: dataElementValidator,
      dataGroups: dataGroupValidator,
      aggregations: yup.array().of(aggregationValidator),
      startDate: dateSpecsValidator,
      endDate: dateSpecsValidator,
    },
    [['dataElements', 'dataGroups']],
  ),
  transform: yup.array().required(),
  output: yup.object(),
});
