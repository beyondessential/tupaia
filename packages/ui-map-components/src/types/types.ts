import { ReactNode } from 'react';
import { CircleMarkerProps, PolygonProps } from 'react-leaflet';
import { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import { Entity as TupaiaEntity, CssColor, IconKey, InlineValue } from '@tupaia/types';
import { BREWER_PALETTE } from '../constants';

export type ColorKey = keyof typeof BREWER_PALETTE;
export type Color = ColorKey | 'transparent' | CssColor;

export type OrgUnitCode = string | undefined;

export type Location = {
  bounds: LatLngBoundsExpression;
  type?: string | null;
  point?: LatLngExpression;
  region: PolygonProps['positions'];
};

// A generic data item for anything that has an 'organisationUnitCode' property
export type GenericDataItem = Record<string, any> & {
  organisationUnitCode: OrgUnitCode;
};

// Extend the base TupaiaEntity type with more details about the entity, including leaflet specific formatting
export type Entity = TupaiaEntity &
  GenericDataItem & {
    region?: PolygonProps['positions'];
    location?: Location;
  };

// Types for markers
export type MarkerProps = {
  radius?: number | string;
  color?: Color;
  children?: ReactNode;
  coordinates: CircleMarkerProps['center'];
  scale?: number;
  handleClick?: (e: any) => void;
  icon?: IconKey;
};

// Types for general measure data, with geometry
export type MeasureData = Omit<PolygonProps, 'positions'> &
  MarkerProps &
  Entity & {
    isHidden?: boolean;
    icon?: IconKey;
    photoUrl?: string;
    value?: number | string;
    positions?: PolygonProps['positions']; //allow this to be optional because of the loose types of measure data
  };

export type Value = InlineValue['value'];
