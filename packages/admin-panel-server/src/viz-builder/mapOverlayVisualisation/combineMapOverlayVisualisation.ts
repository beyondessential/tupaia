/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ValidationError } from '@tupaia/utils';
import { LegacyReport, Report} from '../types';
import { MapOverlay, MapOverlayViz, MapOverlayVizResource } from './types';

// TODO: DRY
const getData = (report: Report) => {
  const { config } = report;
  const { fetch, transform } = config;
  const { aggregations, ...restOfFetch } = fetch;
  return { fetch: restOfFetch, aggregate: aggregations, transform };
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

  if (mapOverlay.legacy) {
    throw new ValidationError('Legacy map overlay viz not supported');
  }

  const { config, permissionGroup: mapOverlayPermissionGroup, ...rest } = mapOverlay;
  const data = getData(report);
  const presentation = getPresentation(mapOverlay, report);

  const visualisation: Record<string, unknown> = {
    mapOverlayPermissionGroup,
    data,
    presentation,
    ...rest,
  };

  return visualisation as MapOverlayViz;
}
