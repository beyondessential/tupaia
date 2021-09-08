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
      },
      [['dataElements', 'dataGroups']],
    ),
    transform: yup.array(),
    output: yup.object(),
  }),
});

export const draftDashboardItemValidator = yup.object().shape({
  code: yup.string().required('Requires "code" for the visualisation'),
  config: yup.object().shape({ type: yup.string().required('Requires "type" in chart config') }),
  reportCode: yup.string().required('Requires "code" for the visualisation'),
});
