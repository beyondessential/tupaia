/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { CamelKeysToSnake, LegacyReport, Report, VizData } from '../types';

type Presentation = Record<string, unknown>;

type MapOverlayVisualisation = {
  id?: string;
  code: string;
  name: string;
  legacy: false;
  data: VizData;
  presentation: Presentation;
  permissionGroup: string;
};
//
// type LegacyMapOverlayVisualisation = {
//   id?: string;
//   code: string;
//   name: string;
//   legacy: true;
//   data: {
//     dataBuilder: string;
//     config: LegacyReport['config'];
//   };
//   presentation: Presentation;
// };
//
export type MapOverlayViz = MapOverlayVisualisation //| LegacyMapOverlayVisualisation;
//
// export interface VisualisationValidator {
//   validate: (object: MapOverlayVisualisation) => void;
// }
//
// export type MapOverlayGroup = {
//   id: string;
//   code: string;
//   name: string;
//   sortOrder?: number;
// };
//
export type MapOverlay = {
  id: string;
  code: string;
  name: string;
  permissionGroup: string;
  config: Record<string, unknown>;
  reportCode: string;
  legacy: boolean;
  linkedMeasures: null | any; // FIXME no any
  dataServices: any; // FIXME
  projectCodes: any; // FIXME
  countryCodes: any; // FIXME
};
//
// export type MapOverlayRelation = {
//   mapOverlayCode: string;
//   entityTypes: string[];
//   projectCodes: string[];
//   permissionGroups: string[];
//   sortOrder?: number;
// };
//
// export type MapOverlayRecord = CamelKeysToSnake<MapOverlay>;
//
// export type MapOverlayItemRecord = CamelKeysToSnake<MapOverlayItem>;
//
// export type MapOverlayRelationRecord = CamelKeysToSnake<Omit<MapOverlayRelation, 'mapOverlayCode'>> & {
//   id: string;
//   child_id: string;
//   mapOverlay_id: string;
// };
//
export type MapOverlayVisualisationResource = { mapOverlay: MapOverlay; report: Report };
//
// export type LegacyMapOverlayVisualisationResource = {
//   mapOverlayItem: MapOverlayItem;
//   report: LegacyReport;
// };
//
export type MapOverlayVizResource =
  | MapOverlayVisualisationResource
  //| LegacyMapOverlayVisualisationResource;