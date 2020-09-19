import {
  convertToPeriod as baseConvertToPeriod,
  periodToTimestamp as basePeriodToTimestamp,
  periodToDisplayString as basePeriodToDisplayString,
} from '@tupaia/utils';

export const convertToPeriod = ({ period, targetType }) => {
  return baseConvertToPeriod(period, targetType);
};

export const periodToTimestamp = ({ period }) => {
  return basePeriodToTimestamp(period);
};

export const periodToDisplayString = ({ period, targetType }) => {
  return basePeriodToDisplayString(period, targetType);
};
