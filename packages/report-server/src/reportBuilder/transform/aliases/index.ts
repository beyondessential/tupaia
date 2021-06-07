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

export const aliases = {
  keyValueByDataElementName,
  keyValueByOrgUnit,
  keyValueByPeriod,
  mostRecentValuePerOrgUnit,
  firstValuePerPeriodPerOrgUnit,
  lastValuePerPeriodPerOrgUnit,
  convertPeriodToWeek,
  convertEventDateToWeek,
};
