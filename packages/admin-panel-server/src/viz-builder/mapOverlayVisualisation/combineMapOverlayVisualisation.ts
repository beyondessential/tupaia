/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { LegacyReport, Report} from '../types';
import { MapOverlay, MapOverlayViz, MapOverlayVizResource } from './types';

// TODO: DRY
const getData = (report: Report) => {
  const { config } = report;
  const { fetch, transform } = config;
  const { aggregations, ...restOfFetch } = fetch;
  return { fetch: restOfFetch, aggregate: aggregations, transform };
};

// TODO: DRY
const getLegacyData = (report: LegacyReport) => {
  const { dataBuilder, config, dataServices } = report;
  return { dataBuilder, config, dataServices };
};

const getPresentation = (mapOverlay: MapOverlay, report: Report | LegacyReport) => {
  const { config: reportConfig } = report;
  const { config } = mapOverlay;

  const presentation = config;
  if (!mapOverlay.legacy) {
    presentation.output = reportConfig.output;
  }

  return presentation;
};

export function combineMapOverlayVisualisation(visualisationResource: MapOverlayVizResource): MapOverlayViz {
  const { mapOverlay, report } = visualisationResource;
  const { config, permissionGroup: mapOverlayPermissionGroup, ...rest } = mapOverlay;
  const data = mapOverlay.legacy
    ? getLegacyData(report as LegacyReport)
    : getData(report as Report);
  const presentation = getPresentation(mapOverlay, report);

  const visualisation: Record<string, unknown> = {
    mapOverlayPermissionGroup,
    data,
    presentation,
    ...rest,
  };
  // TODO: the whole viz builder app: why are we supporting legacy vizes at all? Can't do anything with them in viz builder
  if (!mapOverlay.legacy) {
    visualisation.reportPermissionGroup = (report as Report).permissionGroup;
  }

  return visualisation as MapOverlayViz;
}
