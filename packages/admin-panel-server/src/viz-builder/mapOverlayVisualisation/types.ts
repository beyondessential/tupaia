/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { CamelKeysToSnake, Report, VizData } from '../types';

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
export type MapOverlayViz = MapOverlayVisualisation; // | LegacyMapOverlayVisualisation;

export type MapOverlayGroup = {
  id?: string;
  code: string;
  name: string;
};

export type MapOverlayGroupRecord = CamelKeysToSnake<MapOverlayGroup>;

type DataService = {
  isDataRegional: boolean;
};

export type MapOverlay = {
  id: string;
  code: string;
  name: string;
  permissionGroup: string;
  config: Record<string, unknown>;
  reportCode: string;
  legacy: boolean;
  linkedMeasures: null | string[];
  dataServices: DataService[];
  projectCodes: string[];
  countryCodes: string[];
};

export type MapOverlayGroupRelation = {
  mapOverlayGroupCode: string;
  childCode: string;
  childType: 'mapOverlay' | 'mapOverlayGroup';
  sortOrder?: number;
};

export type MapOverlayRecord = CamelKeysToSnake<MapOverlay>;

export type MapOverlayGroupRelationRecord = CamelKeysToSnake<
  Omit<MapOverlayGroupRelation, 'mapOverlayGroupCode' | 'childCode'>
> & {
  id: string;
  map_overlay_group_id: string;
  child_id: string;
};

export type MapOverlayVisualisationResource = { mapOverlay: MapOverlay; report: Report };
//
// export type LegacyMapOverlayVisualisationResource = {
//   mapOverlayItem: MapOverlayItem;
//   report: LegacyReport;
// };
//
export type MapOverlayVizResource = MapOverlayVisualisationResource;
//| LegacyMapOverlayVisualisationResource;
