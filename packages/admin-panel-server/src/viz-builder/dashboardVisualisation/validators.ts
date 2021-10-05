/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

const dataSourceSchema = (sourceType: 'dataElement' | 'dataGroup') => {
  const otherSourceKey = sourceType === 'dataElement' ? 'dataGroups' : 'dataElements';

  return yup
    .array()
    .of(yup.string())
    .when(['$testData', otherSourceKey], {
      is: ($testData: unknown, otherDataSource: string[]) =>
        !$testData && (!otherDataSource || otherDataSource.length === 0),
      then: yup.array().of(yup.string()).required('Requires "dataGroups" or "dataElements"').min(1),
      otherwise: yup.array().of(yup.string()),
    });
};

const periodTypeSchema = yup.mixed().oneOf(['day', 'week', 'month', 'quarter', 'year']);

const dateSpecsSchema = yup.lazy(value => {
  switch (typeof value) {
    case 'object':
      return yup.object().shape({
        unit: periodTypeSchema,
        offset: yup.number(),
        modifier: yup.mixed().oneOf(['start_of', 'end_of']),
        modifierUnit: periodTypeSchema,
      });
    case 'string':
      return yup.string().min(4);
    case 'undefined':
      return yup.mixed();
    default:
      // eslint-disable-next-line no-template-curly-in-string
      return yup.string().strict().typeError('${path} must be one of string | object');
  }
});

export const baseVisualisationValidator = yup.object().shape({
  presentation: yup.object(),
  data: yup.object(),
});

export const draftReportValidator = yup.object().shape({
  code: yup.string().required('Requires "code" for the visualisation'),
  config: yup.object().shape({
    fetch: yup.object().shape(
      {
        dataElements: dataSourceSchema('dataElement'),
        dataGroups: dataSourceSchema('dataGroup'),
        startDate: dateSpecsSchema,
        endDate: dateSpecsSchema,
      },
      [['dataElements', 'dataGroups']],
    ),
    transform: yup.array(),
    output: yup.object(),
  }),
});

export const legacyReportValidator = yup.object().shape({
  code: yup.string().required('Requires "code" for the visualisation'),
  dataBuilder: yup.string(),
  config: yup.object(),
  dataServices: yup.array().of(yup.object().shape({ isDataRegional: yup.boolean() })),
});

export const draftDashboardItemValidator = yup.object().shape({
  code: yup.string().required('Requires "code" for the visualisation'),
  config: yup.object().shape({ type: yup.string().required('Requires "type" in chart config') }),
  reportCode: yup.string().required('Requires "code" for the visualisation'),
});

export const dashboardSchema = yup.object().shape({
  code: yup.string().required(),
  name: yup.string().required(),
  rootEntityCode: yup.string().required(),
  sortOrder: yup.number().nullable(true),
});

export const dashboardRelationObjectSchema = yup.object().shape({
  dashboardCode: yup.string().required(),
  entityTypes: yup.array().of(yup.string()).required(),
  projectCodes: yup.array().of(yup.string()).required(),
  permissionGroups: yup.array().of(yup.string()).required(),
  sortOrder: yup.number().nullable(true),
});
