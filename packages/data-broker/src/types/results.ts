/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

export interface Analytic {
  dataElement: string;
  organisationUnit: string;
  period: string;
  value: string | number;
}

export interface DataElementMetadata {
  code: string;
  name: string;
}

export interface DataGroupMetadata {
  code: string;
  name: string;
  dataElements?: DataElementMetadata[];
}

export interface DataValue {
  code: string;
  value: string;
  orgUnit: string;
  period: string;
}

export interface Event {
  event: string;
  eventDate: string;
  orgUnit: string;
  orgUnitName: string;
  dataValues: Record<string, string | number>;
}

export interface OutboundEvent {
  event: string;
  eventDate: string;
  orgUnit: string;
  orgUnitName: string;
  dataValues: { code: string; value: string }[];
}

export interface AnalyticResults {
  results: Analytic[];
  metadata: {
    dataElementCodeToName?: Record<string, string>;
  };
  numAggregationsProcessed?: number;
}

export type EventResults = Event[];

export type SyncGroupResults = Record<string, Event[]>;

export interface Diagnostics {
  counts: {
    imported: number;
    updated: number;
    ignored: number;
    deleted: number;
  };
  errors: string[];
  wasSuccessful: boolean;
}
