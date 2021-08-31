/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { VisualisationValidator, DashboardVisualisationObject } from '../types';

export class DraftReportValidator implements VisualisationValidator {
  validationSchema: yup.ObjectSchema;

  constructor() {
    this.validationSchema = yup.object().shape({
      code: yup.string().required('Requires "code" for the visualisation'),
      data: yup.object().shape(
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
          transform: yup.array(),
        },
        ['dataElements', 'dataGroups'],
      ),
    });
  }

  validate(visualisation: DashboardVisualisationObject) {
    this.validationSchema.validateSync(visualisation);
  }
}

export class DraftDashboardItemValidator implements VisualisationValidator {
  validationSchema: yup.ObjectSchema;

  constructor() {
    this.validationSchema = yup.object().shape({
      code: yup.string().required('Requires "code" for the visualisation'),
      presentation: yup.object().shape({
        type: yup.string().required('Requires "type" in chart config'),
        config: yup.object(),
        output: yup.object(),
      }),
    });
  }

  validate(visualisation: DashboardVisualisationObject) {
    this.validationSchema.validateSync(visualisation);
  }
}
