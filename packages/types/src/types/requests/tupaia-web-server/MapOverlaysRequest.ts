/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export interface Params {
  projectCode: string;
  entityCode: string;
}

// We return a simplified version of data to the frontend
export interface TranslatedMapOverlay {
  code: string;
  name: string;
  reportCode: string;
  legacy: boolean;
  // ...config
}
export interface TranslatedMapOverlayGroup {
  name: string;
  children: OverlayChild[];
}
export type OverlayChild = TranslatedMapOverlayGroup | TranslatedMapOverlay;
export interface ResBody {
  name: string;
  entityCode: string;
  entityType: string;
  mapOverlays: OverlayChild[];
}

export type ReqBody = Record<string, never>;
export interface ReqQuery {
  pageSize?: number;
}
