/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { VisualisationValidator, DashboardVisualisationObject } from '../types';

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

const draftReportSchema = yup.object().shape({
  code: yup.string().required('Requires "code" for the visualisation'),
  data: yup.object().shape(
    {
      dataElements: dataSourceSchema('dataElement'),
      dataGroups: dataSourceSchema('dataGroup'),
      aggregations: yup.array(),
      transform: yup.array(),
    },
    ['dataElements', 'dataGroups'],
  ),
});

const draftDashboardItemSchema = yup.object().shape({
  code: yup.string().required('Requires "code" for the visualisation'),
  presentation: yup.object().shape({
    type: yup.string().required('Requires "type" in chart config'),
    config: yup.object(),
    output: yup.object(),
  }),
});

export class DraftReportValidator implements VisualisationValidator {
  // eslint-disable-next-line react/static-property-placement
  private context: Record<string, unknown> = {};

  setContext = (context: Record<string, unknown>) => {
    this.context = context;
  };

  validate(visualisation: DashboardVisualisationObject) {
    draftReportSchema.validateSync(visualisation, { context: this.context });
  }
}

export class DraftDashboardItemValidator implements VisualisationValidator {
  validate(visualisation: DashboardVisualisationObject) {
    draftDashboardItemSchema.validateSync(visualisation);
  }
}
