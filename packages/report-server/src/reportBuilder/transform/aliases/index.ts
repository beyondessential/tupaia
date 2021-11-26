/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  keyValueByDataElementName,
  keyValueByOrgUnit,
  keyValueByPeriod,
} from './keyValueByFieldAliases';
import {
  mostRecentValuePerOrgUnit,
  firstValuePerPeriodPerOrgUnit,
  lastValuePerPeriodPerOrgUnit,
} from './aggregateAliases';
import { convertPeriodToWeek, convertEventDateToWeek } from './periodConversionAliases';
import { insertSummaryRowAndColumn } from './summaryAliases';
import { insertNumberOfFacilitiesColumn } from './entityMetadataAliases';

export const aliases = {
  keyValueByDataElementName,
  keyValueByOrgUnit,
  keyValueByPeriod,
  mostRecentValuePerOrgUnit,
  firstValuePerPeriodPerOrgUnit,
  lastValuePerPeriodPerOrgUnit,
  convertPeriodToWeek,
  convertEventDateToWeek,
  insertSummaryRowAndColumn,
  insertNumberOfFacilitiesColumn: insertNumberOfFacilitiesColumn.transform,
};

export const contextAliasDependencies = {
  insertNumberOfFacilitiesColumn: insertNumberOfFacilitiesColumn.dependencies,
};
