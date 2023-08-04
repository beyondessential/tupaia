/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { KeysToCamelCase } from './helpers.ts';
import { MapOverlay } from '@tupaia/types';
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
// The types from the server and the types defined above need to be merged which will require backend
// changes in MapOverlayRoute.ts
export type MapOverlaysResponse = {
  name: string;
  entityCode: string;
  entityType: string;
  mapOverlays: MapOverlayGroup[];
};
