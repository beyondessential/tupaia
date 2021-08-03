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
      dataElements: yup
        .array()
        .of(yup.string())
        .when('dataGroups', { // dataGroups is required if there are no dataElements 
          is: (dataGroups: string[]) => !dataGroups || dataGroups.length === 0,
          then: yup.array().of(yup.string()).required().min(1),
          otherwise: yup.array().of(yup.string()),
        }),
      dataGroups: yup
        .array()
        .of(yup.string())
        .when('dataElements', { // dataElements is required if there are no dataGroups 
          is: (dataElements: string[]) => !dataElements || dataElements.length === 0,
          then: yup.array().of(yup.string()).required().min(1),
          otherwise: yup.array().of(yup.string()),
        }),
      aggregations: yup.array(),
      transform: yup.array(),
    }, ['dataElements', 'dataGroups']);
  }

  validate(visualisation: DashboardVisualisationObject) {
    const { data: dataObject } = visualisation;
    this.validationSchema.validateSync(dataObject);
  }
}

export class DraftDashboardItemValidator implements VisualisationValidator {
  validationSchema: yup.ObjectSchema;

  constructor() {
    this.validationSchema = yup.object().shape({
      type: yup.string().required(),
      config: yup.object(),
      output: yup.object(),
    });
  }

  validate(visualisation: DashboardVisualisationObject) {
    const { presentation: presentationObject } = visualisation;
    this.validationSchema.validateSync(presentationObject);
  }
}
