/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  keyValueByDataElementName,
  keyValueByOrgUnit,
  keyValueByPeriod,
} from './keyValueByFieldAliases';
import { mostRecentValuePerOrgUnit, firstValuePerPeriodPerOrgUnit } from './aggregateAliases';
import { convertPeriodToWeek } from './periodConversionAliases';

export const aliases = {
  keyValueByDataElementName,
  keyValueByOrgUnit,
  keyValueByPeriod,
  mostRecentValuePerOrgUnit,
  firstValuePerPeriodPerOrgUnit,
  convertPeriodToWeek,
};
