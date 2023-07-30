/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { KeysToCamelCase } from './helpers.ts';
import { MapOverlay, TupaiaWebMapOverlaysRequest } from '@tupaia/types';
import { GRANULARITY_CONFIG } from '@tupaia/utils';

export type SingleMapOverlayItem = KeysToCamelCase<
  Pick<MapOverlay, 'code', 'name', 'legacy', 'report_code'>
> & {
  measureLevel?: string;
  displayType: string;
  periodGranularity?: keyof typeof GRANULARITY_CONFIG;
  startDate?: string;
  endDate?: string;
};

export type MapOverlayGroup = {
  name: MapOverlay['name'];
  children: SingleMapOverlayItem[] | MapOverlayGroup[];
};

// Todo: use TupaiaWebMapOverlaysRequest
export type MapOverlaysResponse = {
  name: string;
  entityCode: string;
  entityType: string;
  mapOverlays: MapOverlayGroup[];
};
