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
} as const;

export const contextAliasDependencies = {} as const;
