/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { MapOverlay } from '../../models';
import { MapOverlayConfig } from '../../models-extra';
import { KeysToCamelCase } from '../../../utils/casing';

export interface Params {
  projectCode: string;
  entityCode: string;
}

// We return a simplified version of data to the frontend
export type TranslatedMapOverlay = KeysToCamelCase<
  Pick<MapOverlay, 'code' | 'name' | 'legacy' | 'report_code'>
> &
  MapOverlayConfig & {
    sortOrder?: number | null;
  };
export interface TranslatedMapOverlayGroup {
  name: string;
  children: OverlayChild[];
  sortOrder?: number | null;
}
export type OverlayChild = TranslatedMapOverlayGroup | TranslatedMapOverlay;
export interface ResBody {
  name: string;
  entityCode: string;
  entityType: string;
  mapOverlays: TranslatedMapOverlayGroup[];
}

export type ReqBody = Record<string, never>;
export interface ReqQuery {
  pageSize?: number;
}
