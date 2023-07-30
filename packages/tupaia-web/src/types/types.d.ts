/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  LandingPage,
  Project,
  Country,
  Entity as BaseEntity,
  MapOverlay,
  TupaiaWebDashboardsRequest,
  TupaiaWebProjectRequest,
} from '@tupaia/types';
import { GRANULARITY_CONFIG } from '@tupaia/utils';
import { ActivePolygonProps } from '@tupaia/ui-map-components';
import { Position } from 'geojson';
import { KeysToCamelCase } from './helpers';

export type SingleProject = TupaiaWebProjectRequest.ResBody & {
  hasAccess: boolean;
  hasPendingAccess: boolean;
  homeEntityCode: string;
  defaultDashboard: string;
  name: string;
  names: string[];
  config: any;
};

export type SingleLandingPage = KeysToCamelCase<Omit<LandingPage, 'project_codes'>> & {
  projects: SingleProject[];
};

export type CountryAccessListItem = Country & {
  hasAccess: boolean;
  accessRequests: string[];
};

export type ProjectCode = Project['code'];

export type EntityCode = Entity['code'];

export type Dashboard = TupaiaWebDashboardsRequest.ResBody[0];

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

// re-type the coordinates to be what the ui-map-components expect, because in the types package they are any | null
export type Entity = KeysToCamelCase<Omit<BaseEntity, 'region' | 'bounds'>> & {
  region?: ActivePolygonProps['coordinates'];
  bounds?: Position[];
};

export type EntityResponse = Entity & {
  parentCode: Entity['code'];
  childCodes: Entity['code'][];
  photoUrl?: string;
  children?: Entity[];
};
