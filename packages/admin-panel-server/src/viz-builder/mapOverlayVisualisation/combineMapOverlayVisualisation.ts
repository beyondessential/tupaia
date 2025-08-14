import { ValidationError } from '@tupaia/utils';
import { LegacyReport, Report } from '../types';
import { extractDataFromReport } from '../utils';
import { MapOverlay, MapOverlayViz, MapOverlayVizResource } from './types';

const getPresentation = (mapOverlay: MapOverlay, report: Report | LegacyReport) => {
  const { config: reportConfig } = report;
  const { config } = mapOverlay;

  const presentation = config;
  if (!mapOverlay.legacy && 'output' in reportConfig) {
    presentation.output = reportConfig.output;
  }

  return presentation;
};

export function combineMapOverlayVisualisation(
  visualisationResource: MapOverlayVizResource,
): MapOverlayViz {
  const { mapOverlay, report } = visualisationResource;

  if (mapOverlay.legacy) {
    throw new ValidationError('Legacy map overlay viz not supported');
  }

  const { config, permissionGroup: mapOverlayPermissionGroup, ...rest } = mapOverlay;
  const data = extractDataFromReport(report);
  const presentation = getPresentation(mapOverlay, report);

  const visualisation: Record<string, unknown> = {
    mapOverlayPermissionGroup,
    data,
    presentation,
    reportPermissionGroup: report?.permissionGroup,
    latestDataParameters: report?.latestDataParameters ?? {},
    ...rest,
  };

  return visualisation as MapOverlayViz;
}
