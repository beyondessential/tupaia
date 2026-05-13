import { isNil, omitBy } from 'es-toolkit/compat';

import { snakeKeys, yup } from '@tupaia/utils';

import type { MapOverlayVisualisationResource } from './types';
import type { LegacyReport, Report, ExpandType } from '../types';
import { PreviewMode } from '../types';
import { baseVisualisationValidator, baseVisualisationDataValidator } from '../validators';
import { getVizOutputConfig } from '../utils';

export class MapOverlayVisualisationExtractor<
  MapOverlayValidator extends yup.AnyObjectSchema,
  ReportValidator extends yup.AnyObjectSchema,
> {
  private readonly visualisation: ExpandType<yup.InferType<typeof baseVisualisationValidator>>;
  private readonly mapOverlayValidator: MapOverlayValidator;
  private readonly reportValidator: ReportValidator;
  private reportValidatorContext: Record<string, unknown> = {};

  public constructor(
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
    // Resources (like the ones passed to central-server for upsert) use snake_case keys
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
      entityAttributesFilter,
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
      entityAttributesFilter,
    };
  }

  public getMapOverlay(): ExpandType<yup.InferType<MapOverlayValidator>> {
    return this.mapOverlayValidator.validateSync(this.vizToMapOverlay());
  }

  private vizToReport(
    previewMode: PreviewMode = PreviewMode.PRESENTATION,
  ): Record<keyof Report, unknown> {
    const { code, reportPermissionGroup: permissionGroup, data, presentation } = this.visualisation;
    const validatedData = baseVisualisationDataValidator.validateSync(data);

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
      latestDataParameters: {},
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
