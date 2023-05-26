import { PolygonProps } from 'react-leaflet';
import { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import { Entity as TupaiaEntity } from '@tupaia/types';
import { Color } from './types';
import { MarkerProps } from './marker-types';

export type Series = {
  key: string;
  name: string;
  hideFromPopup?: boolean;
  metadata: object;
  value: string | number;
  organisationUnit?: string;
  sortOrder: number;
  type?: string;
  popupHeaderFormat?: string;
};

export type Location = {
  bounds: LatLngBoundsExpression;
  type?: string | null;
  point?: LatLngExpression;
  region: PolygonProps['positions'];
};

export type GenericDataItem = {
  [key: string]: any;
  organisationUnitCode?: string;
};

// Extend the base TupaiaEntity type with more details about the entity, including leaflet specific formatting
export type Entity = TupaiaEntity &
  GenericDataItem & {
    region?: PolygonProps['positions'];
    location?: Location;
  };

export type MeasureOrgUnit = GenericDataItem & {
  [key: string]: any;
  isHidden?: boolean;
  color?: Color;
};

export type MeasureData = MeasureOrgUnit &
  PolygonProps &
  MarkerProps &
  Entity & {
    coordinates?: PolygonProps['positions'];
    icon?: string;
    photoUrl?: string;
    value?: number | string;
  };
