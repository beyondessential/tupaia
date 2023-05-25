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

// Extend the base TupaiaEntity type with more details about the entity, including leaflet specific formatting
export type Entity = TupaiaEntity & {
  region?: PolygonProps['positions'];
  organisationUnitCode: string;
  location?: Location;
};

export type GenericDataItem = {
  [key: string]: any;
  organisationUnitCode?: string;
};

export type MeasureOrgUnit = GenericDataItem & {
  [key: string]: any;
  organisationUnitCode?: string;
  isHidden?: boolean;
  color?: Color;
};

export type MeasureData = MeasureOrgUnit &
  PolygonProps &
  MarkerProps & {
    coordinates: PolygonProps['positions'];
    region?: PolygonProps['positions'];
    icon?: string;
    code?: string;
    name?: string;
    photoUrl?: string;
    value?: number | string;
  };
