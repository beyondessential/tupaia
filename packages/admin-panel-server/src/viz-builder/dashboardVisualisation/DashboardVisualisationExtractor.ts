/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { isNil, omitBy } from 'lodash';

import { snakeKeys, yup } from '@tupaia/utils';

import { PreviewMode, DashboardVisualisationResource } from '../types';
import { LegacyReport, Report } from '..';
import { extractFetch } from './helpers';
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

  public getDashboardVisualisationResource = (previewMode?: PreviewMode) => {
    // Resources (like the ones passed to meditrak-server for upsert) use snake_case keys
    const dashboardItem = this.getDashboardItem();
    const report = this.getReport(previewMode);

    return {
      dashboardItem: snakeKeys(dashboardItem),
      report: snakeKeys(report),
    } as DashboardVisualisationResource;
  };

  private vizToDashboardItem() {
    const { id, code, name, legacy } = this.visualisation;
    const { output, ...presentation } = this.visualisation.presentation;

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
      legacy: !!legacy,
    };
  }

  public getDashboardItem(): ExpandType<yup.InferType<DashboardItemValidator>> {
    if (!this.dashboardItemValidator) {
      throw new Error('No validator provided for extracting dashboard item');
    }
    return this.dashboardItemValidator.validateSync(this.vizToDashboardItem());
  }

  private vizToReport(previewMode?: PreviewMode): Record<keyof Report, unknown> {
    const { code, permissionGroup, data, presentation } = this.visualisation;

    const fetch = extractFetch(data);
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

  private vizToLegacyReport(): Record<keyof LegacyReport, unknown> {
    const { code, data } = this.visualisation;
    const { dataBuilder, config, dataServices } = data;

    return {
      code,
      dataBuilder,
      config,
      dataServices,
    };
  }

  public getReport(previewMode?: PreviewMode): ExpandType<yup.InferType<ReportValidator>> {
    if (!this.reportValidator) {
      throw new Error('No validator provided for extracting report');
    }

    const report = this.visualisation.legacy
      ? this.vizToLegacyReport()
      : this.vizToReport(previewMode);
    return this.reportValidator.validateSync(report, { context: this.reportValidatorContext });
  }
}
