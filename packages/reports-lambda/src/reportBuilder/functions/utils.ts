import {
  convertToPeriod as baseConvertToPeriod,
  periodToTimestamp as basePeriodToTimestamp,
  periodToDisplayString as basePeriodToDisplayString,
} from '@tupaia/utils';

export const convertToPeriod = ({
  period,
  targetType,
}: {
  period: string;
  targetType: string;
}): string => {
  return baseConvertToPeriod(period, targetType);
};

export const periodToTimestamp = ({ period }: { period: string }): string => {
  return basePeriodToTimestamp(period);
};

export const periodToDisplayString = ({
  period,
  targetType,
}: {
  period: string;
  targetType: string;
}): string => {
  return basePeriodToDisplayString(period, targetType);
};
