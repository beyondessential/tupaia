/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

export const baseVisualisationValidator = yup.object().shape({
  presentation: yup.object(),
  data: yup.object(),
});

export const draftReportValidator = yup.object().shape({
  code: yup.string().required('Requires "code" for the visualisation'),
  config: yup.object().shape({
    fetch: yup.object().shape(
      {
        dataElements: yup
          .array()
          .of(yup.string())
          .when('dataGroups', {
            // dataGroups is required if there are no dataElements
            is: (dataGroups: string[]) => !dataGroups || dataGroups.length === 0,
            then: yup
              .array()
              .of(yup.string())
              .required('Requires "dataGroups" or "dataElements"')
              .min(1),
            otherwise: yup.array().of(yup.string()),
          }),
        dataGroups: yup
          .array()
          .of(yup.string())
          .when('dataElements', {
            // dataElements is required if there are no dataGroups
            is: (dataElements: string[]) => !dataElements || dataElements.length === 0,
            then: yup
              .array()
              .of(yup.string())
              .required('Requires "dataGroups" or "dataElements"')
              .min(1),
            otherwise: yup.array().of(yup.string()),
          }),
        aggregations: yup.array(),
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
});
