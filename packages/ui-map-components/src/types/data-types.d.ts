import { PolygonProps } from 'react-leaflet';
import { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import { Entity as TupaiaEntity } from '@tupaia/types';
import { BREWER_PALETTE } from '../constants';

export type Series = {
  key: string;
  name: string;
  hideFromPopup?: boolean;
  metadata: object;
  value: string | number;
  organisationUnit?: string;
  sortOrder: number;
  type?: string;
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
  color?: keyof typeof BREWER_PALETTE | 'transparent';
};

export type MeasureData = MeasureOrgUnit &
  PolygonProps & {
    coordinates?: PolygonProps['positions'];
    region: PolygonProps['positions'];
    radius?: number;
    icon?: string;
    code?: string;
    name?: string;
    photoUrl?: string;
    value?: number | string;
  };
