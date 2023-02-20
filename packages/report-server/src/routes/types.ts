/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export type ReportRouteQuery = {
  organisationUnitCodes?: string;
  hierarchy?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
  permissionGroup?: string;
};

export type ReportRouteBody = {
  organisationUnitCodes?: string[];
  hierarchy?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
};

export type AggregationOptionsRouteQuery = {
  searchText?: string;
};
