import { checkTimeliness, getLevel as checkTimelinessGetLevel } from './checkTimeliness';
import {
  composePercentagePerOrgUnit,
  getLevel as composePercentagePerOrgUnitGetLevel,
} from './composePercentagePerOrgUnit';
import {
  countEventsPerOrgUnit,
  getLevel as countEventsPerOrgUnitGetLevel,
} from './countEventsPerOrgUnit';
import {
  mostRecentValueFromChildren,
  getLevel as mostRecentValueFromChildrenGetLevel,
} from './mostRecentValueFromChildren';
import { sumLatestPerOrgUnit, getLevel as sumLatestPerOrgUnitGetLevel } from './sumPerOrgUnit';
import { valueForOrgGroup, getLevel as valueForOrgGroupGetLevel } from './valueForOrgGroup';

export const measureBuilders = {
  checkTimeliness,
  composePercentagePerOrgUnit,
  countEventsPerOrgUnit,
  mostRecentValueFromChildren,
  sumLatestPerOrgUnit,
  valueForOrgGroup,
};

export const getLevels = {
  checkTimeliness: checkTimelinessGetLevel,
  composePercentagePerOrgUnit: composePercentagePerOrgUnitGetLevel,
  countEventsPerOrgUnit: countEventsPerOrgUnitGetLevel,
  mostRecentValueFromChildren: mostRecentValueFromChildrenGetLevel,
  sumLatestPerOrgUnit: sumLatestPerOrgUnitGetLevel,
  valueForOrgGroup: valueForOrgGroupGetLevel,
};
