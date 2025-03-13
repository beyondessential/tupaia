export interface Analytic {
  dataElement: string;
  organisationUnit: string;
  period: string; // should be in format YYYYMMDD e.g. "20210103"
  value: string | number | null;
}

export interface DataElementMetadata {
  code: string;
  name?: string;
}

export interface DhisMetadataObject {
  id: string;
  code: string;
  name: string;
  options?: Record<string, string>;
}

export interface DataGroupMetadata {
  code: string;
  name?: string;
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
  dataValues: Record<string, string | number | null>;
  trackedEntityId?: string;
  trackedEntityCode?: string;
}

export interface OutboundEvent {
  event: string;
  eventDate: string;
  orgUnit: string;
  orgUnitName: string;
  dataValues: { code: string; value: string }[];
}

/**
 * Direct from the data service aka "raw". Not yet processed as final output
 * from DataBroker's pullAnalytics().
 */
export interface RawAnalyticResults {
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
