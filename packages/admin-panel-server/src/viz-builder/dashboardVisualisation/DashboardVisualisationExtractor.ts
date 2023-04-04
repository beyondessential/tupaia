/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { isNil, omitBy } from 'lodash';

import { snakeKeys, yup } from '@tupaia/utils';

import type { DashboardVisualisationResource } from './types';
import type { LegacyReport, Report, ExpandType } from '../types';
import { PreviewMode } from '../types';
import { baseVisualisationValidator, baseVisualisationDataValidator } from '../validators';
import { getVizOutputConfig } from '../utils';

export class DashboardVisualisationExtractor<
  DashboardItemValidator extends yup.AnyObjectSchema,
  ReportValidator extends yup.AnyObjectSchema
> {
  private readonly visualisation: ExpandType<yup.InferType<typeof baseVisualisationValidator>>;
  private readonly dashboardItemValidator: DashboardItemValidator;
  private readonly reportValidator: ReportValidator;
  private reportValidatorContext: Record<string, unknown> = {};

  public constructor(
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
    // Resources (like the ones passed to central-server for upsert) use snake_case keys
    const dashboardItem = this.getDashboardItem();
    const report = this.getReport(PreviewMode.PRESENTATION); // always fetch full report when building resource

    return {
      dashboardItem: snakeKeys(dashboardItem),
      report: snakeKeys(report),
    } as DashboardVisualisationResource;
  };

  private vizToDashboardItem() {
    const { code, name, legacy } = this.visualisation;
    const { output, ...presentation } = this.visualisation.presentation;

    return {
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
    return this.dashboardItemValidator.validateSync(this.vizToDashboardItem());
  }

  private vizToReport(
    previewMode: PreviewMode = PreviewMode.PRESENTATION,
  ): Record<keyof Report, unknown> {
    const { code, permissionGroup, data, presentation } = this.visualisation;
    const validatedData = baseVisualisationDataValidator.validateSync(data);

    if (validatedData.customReport) {
      return {
        config: {
          customReport: validatedData.customReport,
        },
        code,
        permissionGroup,
      };
    }

    const { transform } = validatedData;

    const output = getVizOutputConfig(previewMode, presentation);
    const config = omitBy(
      {
        transform,
        output,
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
    const report = this.visualisation.legacy
      ? this.vizToLegacyReport()
      : this.vizToReport(previewMode);
    return this.reportValidator.validateSync(report, { context: this.reportValidatorContext });
  }
}
