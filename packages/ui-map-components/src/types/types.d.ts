/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { CircleMarkerProps, PolygonProps } from 'react-leaflet';
import { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import { Entity as TupaiaEntity, CssColor } from '@tupaia/types';
import { ReferenceProps } from '@tupaia/ui-components';
import { VALUE_TYPES } from '@tupaia/utils';
import { MEASURE_TYPES, SCALE_TYPES, BREWER_PALETTE } from '../constants';
import { Color } from './types';
import { MarkerProps } from './marker-types';
import { DataValue } from './legend';
import { ValueOf } from './helpers';
import { ReactNode } from 'react';
import { IconKey } from '../components';

export type ColorKey = keyof typeof BREWER_PALETTE;
export type Color = ColorKey | 'transparent' | CssColor;

export type ScaleType = `${SCALE_TYPES}`;
export type MeasureType = `${MEASURE_TYPES}`;
export type OrgUnitCode = string | undefined;

export type Location = {
  bounds: LatLngBoundsExpression;
  type?: string | null;
  point?: LatLngExpression;
  region: PolygonProps['positions'];
};

// A generic data item for anything that has an 'organisationUnitCode' property
export type GenericDataItem = {
  [key: string]: any;
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
    icon?: string;
    photoUrl?: string;
    value?: number | string;
    submissionDate?: string | Date;
    positions?: PolygonProps['positions']; //allow this to be optional because of the loose types of measure data
  };
