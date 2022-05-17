/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import {
  DataElement as BaseDataElement,
  DataGroup as BaseDataGroup,
  DataSource as BaseDataSourceI,
} from '../../types';

export type DataType = 'DataElement' | 'Indicator' | 'ProgramIndicator';

type PeriodType = 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | ' YEAR';

type DataSourceConfig = Partial<{
  dhisId: string;
  isDataRegional: boolean;
}>;

type DataElementConfig = DataSourceConfig &
  Partial<{
    categoryOptionCombo: string;
    dhisDataType: DataType;
    indicator: {
      dataPeriodType: PeriodType;
    };
  }>;

export type DataSourceI = BaseDataSourceI & { config: DataSourceConfig };
export type DataElement = BaseDataElement & { config: DataElementConfig };
export type DataGroup = BaseDataGroup & { config: DataSourceConfig };

export type AnalyticDimension = 'dx' | 'ou' | 'pe' | 'value';

export type DhisAnalyticDimension = AnalyticDimension | 'co';

export type EventDimension = AnalyticDimension | 'psi' | 'oucode' | 'ouname' | 'ou' | 'eventdate';

/**
 * Data element value types, taken from
 * https://docs.dhis2.org/2.33/en/developer/html/dhis2_developer_manual_full.html#webapi_csv_data_elements
 */
export type ValueType =
  | 'INTEGER'
  | 'NUMBER'
  | 'UNIT_INTERVAL'
  | 'PERCENTAGE'
  | 'INTEGER_POSITIVE'
  | 'INTEGER_NEGATIVE'
  | 'INTEGER_ZERO_OR_POSITIVE'
  | 'FILE_RESOURCE'
  | 'COORDINATE'
  | 'TEXT'
  | 'LONG_TEXT'
  | 'LETTER'
  | 'PHONE_NUMBER'
  | 'EMAIL'
  | 'BOOLEAN'
  | 'TRUE_ONLY'
  | 'DATE'
  | 'DATETIME';

export interface DhisAnalytics {
  headers: {
    name: string;
    column: string;
    valueType?: ValueType;
  }[];
  metaData: {
    items: Record<
      string,
      {
        uid: string;
        code: string;
        name: string;
        dimensionItemType: 'DATA_ELEMENT' | 'ORGANISATION_UNIT' | 'PERIOD' | 'INDICATOR';
      }
    >;
    dimensions: Record<string, string[]>;
  };
  rows: string[][];
}

export interface DhisEventAnalytics {
  headers: {
    name: string;
    column: string;
    valueType?: ValueType;
  }[];
  metaData: {
    items: Record<string, { name: string }>;
    dimensions: Record<string, string[]>;
  };
  rows: string[][];
  width?: number;
  height?: number;
}

export interface DhisEvent {
  event: string;
  eventDate: string;
  orgUnit: string;
  orgUnitName: string;
  dataValues: {
    dataElement: string;
    value: string;
  }[];
}
