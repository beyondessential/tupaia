import { PolygonProps } from 'react-leaflet';
import { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import { Entity as TupaiaEntity } from '@tupaia/types';
import { ReferenceProps } from '@tupaia/ui-components';
import { VALUE_TYPES } from '@tupaia/utils';
import { MEASURE_TYPES, SCALE_TYPES } from '../constants';
import { Color } from './types';
import { MarkerProps } from './marker-types';
import { DataValue } from './legend-types';
import { ValueOf } from './helpers';

const ValueTypes = { ...VALUE_TYPES } as const;

type ValueTypesKeys = keyof typeof ValueTypes;
type ValueTypeValues = typeof VALUE_TYPES[ValueTypesKeys];

export type DataValueType = string | number | null | undefined;
export type ScaleType = `${SCALE_TYPES}`;
export type MeasureType = `${MEASURE_TYPES}`;

export type DataValue = {
  value: DataValueType | DataValueType[];
  name: string;
  hideFromLegend?: boolean;
  icon?: IconKey;
  color: string;
  label?: string;
};

export type ValueMappingType = {
  null: DataValue;
  [key: string]: DataValue;
};

export type BaseSeriesItem = {
  name: string;
  key: string;
  values: DataValue[];
  valueMapping: ValueMappingType;
  hideFromLegend?: boolean;
  type: MeasureType;
  startDate?: string;
  endDate?: string;
  hideByDefault?: Record<string, boolean>;
  displayedValueKey?: string;
  color: string;
  icon?: IconKey;
  radius?: number;
  scaleBounds?: {
    left: number;
    right: number;
  };
  hideFromPopup?: boolean;
  metadata: object;
  organisationUnit?: string;
  sortOrder: number;
  popupHeaderFormat?: string;
  valueType?: ValueTypeValues;
};

export type MarkerSeriesItem = BaseSeriesItem & {
  icon?: IconKey;
};

export type SpectrumSeriesItem = BaseSeriesItem & {
  scaleColorScheme: ColorScheme;
  min: number;
  max: number;
  scaleType: ScaleType;
  valueType: string;
  dataKey?: string;
  noDataColour?: string;
};

export type Series = MarkerSeriesItem & SpectrumSeriesItem;

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
    submissionDate?: string | Date;
  };

export type TileSet = {
  key: string;
  label: string;
  thumbnail: string;
  reference?: ReferenceProps;
  legendItems?: DataValue[];
};
