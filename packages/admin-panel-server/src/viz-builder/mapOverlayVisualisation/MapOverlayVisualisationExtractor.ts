/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { isNil, omitBy } from 'lodash';

import { snakeKeys, yup } from '@tupaia/utils';

import type { MapOverlayVisualisationResource } from './types';
import type { LegacyReport, Report, ExpandType } from '../types';
import { PreviewMode } from '../types';
import { baseVisualisationValidator, baseVisualisationDataValidator } from '../validators';

export class MapOverlayVisualisationExtractor<
  MapOverlayValidator extends yup.AnyObjectSchema,
  ReportValidator extends yup.AnyObjectSchema
> {
  private readonly visualisation: ExpandType<yup.InferType<typeof baseVisualisationValidator>>;

  private readonly mapOverlayValidator: MapOverlayValidator;

  private readonly reportValidator: ReportValidator;

  private reportValidatorContext: Record<string, unknown> = {};

  constructor(
    visualisation: Record<string, unknown>,
    mapOverlayValidator: MapOverlayValidator,
    reportValidator: ReportValidator,
  ) {
    this.visualisation = baseVisualisationValidator.validateSync(visualisation);
    this.mapOverlayValidator = mapOverlayValidator;
    this.reportValidator = reportValidator;
  }

  public setReportValidatorContext = (context: Record<string, unknown>) => {
    this.reportValidatorContext = context;
  };

  public getMapOverlayVisualisationResource = () => {
    // Resources (like the ones passed to meditrak-server for upsert) use snake_case keys
    const mapOverlay = this.getMapOverlay();
    const report = this.getReport(PreviewMode.PRESENTATION); // always fetch full report when building resource

    return {
      mapOverlay: snakeKeys(mapOverlay),
      report: snakeKeys(report),
    } as MapOverlayVisualisationResource;
  };

  private vizToMapOverlay() {
    const {
      code,
      name,
      legacy,
      projectCodes,
      countryCodes,
      linkedMeasures,
      mapOverlayPermissionGroup: permissionGroup,
    } = this.visualisation;
    const { output, ...presentation } = this.visualisation.presentation;

    return {
      code,
      config: {
        ...presentation,
      },
      name,
      reportCode: code,
      legacy: !!legacy,
      projectCodes,
      countryCodes,
      linkedMeasures,
      permissionGroup,
    };
  }

  public getMapOverlay(): ExpandType<yup.InferType<MapOverlayValidator>> {
    if (!this.mapOverlayValidator) {
      throw new Error('No validator provided for extracting map overlay');
    }
    return this.mapOverlayValidator.validateSync(this.vizToMapOverlay());
  }

  private vizToReport(previewMode?: PreviewMode): Record<keyof Report, unknown> {
    const { code, reportPermissionGroup: permissionGroup, data, presentation } = this.visualisation;
    const validatedData = baseVisualisationDataValidator.validateSync(data);

    const { fetch: vizFetch, aggregate, transform } = validatedData;

    const fetch = omitBy(
      {
        ...vizFetch,
        aggregations: aggregate,
      },
      isNil,
    );
    const config = omitBy(
      {
        fetch,
        transform,
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
