import { MapOverlay } from '../../models';

export interface Params {
  projectCode: string;
  entityCode: string;
  mapOverlayCode: MapOverlay['code'];
}
export interface ResBody {
  contents: Uint8Array;
  filePath?: string;
  type: string;
}
export type ReqBody = {
  cookieDomain: string;
  baseUrl: string;
  center: string;
  zoom: number;
  tileset: string;
  hiddenValues: string;
  mapOverlayPeriod?: string;
  locale?: string;
  format?: 'pdf' | 'png';
};
export type ReqQuery = Record<string, string>;
