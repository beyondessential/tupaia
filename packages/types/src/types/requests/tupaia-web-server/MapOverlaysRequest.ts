/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { MapOverlay } from '../../models';
import { EntityType, MapOverlayConfig, ReferenceProps } from '../../models-extra';
import { KeysToCamelCase } from '../../../utils';

export interface Params {
  projectCode: string;
  entityCode: string;
}

// We return a simplified version of data to the frontend
export type TranslatedMapOverlay = KeysToCamelCase<
  Pick<MapOverlay, 'code' | 'name' | 'legacy' | 'report_code' | 'entity_attributes_filter'>
> &
  MapOverlayConfig & {
    sortOrder?: number | null;
    disabled?: boolean;
  };
export interface TranslatedMapOverlayGroup {
  name: string;
  children: OverlayChild[];
  sortOrder?: number | null;
  info?: { reference?: ReferenceProps };
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
