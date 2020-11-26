import {
  keyValueByDataElementName,
  keyValueByOrgUnit,
  keyValueByPeriod,
} from './keyValueByFieldAliases';
import {
  aggregateMostRecentValuePerOrgUnit,
  aggregateFirstValuePerPeriodPerOrgUnit,
} from './aggregateAliases';
import { convertPeriodToWeek } from './periodConversionAliases';

export const aliases = {
  keyValueByDataElementName,
  keyValueByOrgUnit,
  keyValueByPeriod,
  aggregateMostRecentValuePerOrgUnit,
  aggregateFirstValuePerPeriodPerOrgUnit,
  convertPeriodToWeek,
};
