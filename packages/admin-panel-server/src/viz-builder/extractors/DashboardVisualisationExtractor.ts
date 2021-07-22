/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { DashboardVisualisationObject } from '../types';
import { omitBy, isNil } from 'lodash';

export abstract class DashboardVisualisationExtractor {
  private readonly visualisationObject: DashboardVisualisationObject;

  private validationSchema: yup.ObjectSchema;

  private dataValidationSchema: yup.ObjectSchema;

  private presentationValidationSchema: yup.ObjectSchema;

  constructor(visualisationObject: DashboardVisualisationObject) {
    this.visualisationObject = visualisationObject;
  }

  protected getValidationSchema() {
    if (!this.validationSchema) {
      this.validationSchema = yup.object().shape({
        code: yup.string().required(),
        name: yup.string().required(),
        permissionGroup: yup.string().required(),
      });
    }
    
    return this.validationSchema;
  }

  protected getDataValidationSchema() {
    if (!this.dataValidationSchema) {
      // Even if just draft version, data/report should at least have dataElements or dataGroups defined
      this.dataValidationSchema = yup.object().shape({
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

    return this.dataValidationSchema;
  }

  protected getPresentationValidationSchema() {
    if (!this.presentationValidationSchema) {
      // Even if just draft version, presentation/dashboard_item should at least have type or config defined
      this.presentationValidationSchema = yup.object().shape({
        type: yup.string().required(),
        config: yup.object(),
        output: yup.object(),
      });
    }
    
    return this.presentationValidationSchema;
  }

  protected validateData() {
    const { data: dataObject } = this.visualisationObject;
    this.getDataValidationSchema().validateSync(dataObject);
  }

  protected validatePresentation() {
    const { presentation: presentationObject } = this.visualisationObject;
    this.getPresentationValidationSchema().validateSync(presentationObject);

  }

  protected validateMain() {
    this.getValidationSchema().validateSync(this.visualisationObject);
  }

  protected extractReport() {
    const { code, permissionGroup, data, presentation } = this.visualisationObject;
    const { dataElements, dataGroups, aggregations } = data;

    // Remove empty config
    const fetch = omitBy(
      {
        dataElements,
        dataGroups,
        aggregations,
      },
      isNil,
    );

    // Remove empty config
    const config = omitBy(
      {
        fetch,
        transform: data.transform,
        output: presentation?.output,
      },
      isNil,
    );

    return {
      code,
      permissionGroup,
      config,
    };
  }

  protected extractDashboardItem() {
    const { code, name, presentation } = this.visualisationObject;
    return {
      code,
      config: {
        type: presentation.type,
        ...presentation.config,
        name,
      },
      reportCode: code,
      legacy: false,
    };
  }

  abstract validate(): void;

  abstract extractFromVisualisationObject(): unknown;

  extract() {
    this.validate();
    return this.extractFromVisualisationObject();
  }
}
