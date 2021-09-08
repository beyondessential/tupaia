/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { isNil, omitBy } from 'lodash';

import { snakeKeys, yup } from '@tupaia/utils';
import { PreviewMode, CamelKeysToSnake } from '../types';

import { baseVisualisationValidator } from './validators';

// expands object types recursively
// TODO: Move this type to a generic @tupaia/utils-ts package
type ExpandType<T> = T extends Record<string, unknown>
  ? T extends infer O
    ? {
        [K in keyof O]: ExpandType<O[K]>;
      }
    : never
  : T;

export class DashboardVisualisationExtractor<
  DashboardItemValidator extends yup.AnyObjectSchema,
  ReportValidator extends yup.AnyObjectSchema
> {
  private readonly visualisation: ExpandType<yup.InferType<typeof baseVisualisationValidator>>;

  private readonly dashboardItemValidator: DashboardItemValidator;

  private readonly reportValidator: ReportValidator;

  private reportValidatorContext: Record<string, unknown> = {};

  constructor(
    visualisation: Record<string, unknown>,
    dashboardItemValidator: DashboardItemValidator,
    reportValidator: ReportValidator,
  ) {
    this.visualisation = baseVisualisationValidator.validateSync(visualisation);
    this.dashboardItemValidator = dashboardItemValidator;
    this.reportValidator = reportValidator;
  }

  public setReportValidatorContext = (context: Record<string, unknown>) => {
    this.reportValidatorContext = context;
  };

  public getDashboardVisualisationResource = () => {
    // Resources (like the ones passed to meditrak-server for upsert) use snake_case keys
    const dashboardItem = this.getDashboardItem();
    const report = this.getReport();

    return { dashboardItem: snakeKeys(dashboardItem), report: snakeKeys(report) } as {
      dashboardItem: ExpandType<CamelKeysToSnake<typeof dashboardItem>>;
      report: ExpandType<CamelKeysToSnake<typeof report>>;
    };
  };

  private vizToDashboardItem() {
    const { id, code, name, presentation } = this.visualisation;
    return {
      id,
      code,
      // TODO: for prototype, the whole presentation object will be the json edit box
      // But in the future, it will be broken down into different structure.
      // config: {
      //   type: presentation.type,
      //   ...presentation.config,
      //   name,
      // },
      config: {
        ...presentation,
        name,
      },
      reportCode: code,
      legacy: false,
    };
  }

  public getDashboardItem(): ExpandType<yup.InferType<DashboardItemValidator>> {
    if (!this.dashboardItemValidator) {
      throw new Error('No validator provided for extracting dashboard item');
    }
    return this.dashboardItemValidator.validateSync(this.vizToDashboardItem());
  }

  private vizToReport(previewMode?: PreviewMode) {
    const { code, permissionGroup, data, presentation } = this.visualisation;
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
        output: previewMode === PreviewMode.PRESENTATION ? presentation?.output : null,
      },
      isNil,
    );

    return {
      code,
      permissionGroup,
      config,
    };
  }

  public getReport(previewMode?: PreviewMode): ExpandType<yup.InferType<ReportValidator>> {
    if (!this.reportValidator) {
      throw new Error('No validator provided for extracting report');
    }
    return this.reportValidator.validateSync(this.vizToReport(previewMode), {
      context: this.reportValidatorContext,
    });
  }
}
