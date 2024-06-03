/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { MapOverlay } from '../../models';

export interface Params {
  projectCode: string;
  entityCode: string;
  mapOverlayCode: MapOverlay['code'];
}
export interface ResBody {
  contents: Buffer;
  filePath?: string;
  type: string;
}
export type ReqBody = {
  cookieDomain: string;
  baseUrl: string;
  bounds: string;
  basemap: string;
  hiddenValues: string;
};
export type ReqQuery = Record<string, string>;
