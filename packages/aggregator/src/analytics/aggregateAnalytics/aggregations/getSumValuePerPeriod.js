import { convertToPeriod } from '@tupaia/utils';

export const getSumValuePerPeriod = (analytics, aggregationConfig, aggregationPeriod) => {
  const summedAnalyticsByPeriodDataElmOrgUnit = {};
  analytics.forEach(analytic => {
    const { dataElement, organisationUnit, period, value } = analytic;
    const convertedPeriod = convertToPeriod(period, aggregationPeriod);
    const key = getPeriodOrgUnitDataElmKey(convertedPeriod, organisationUnit, dataElement);
    const matchingAnalytic = summedAnalyticsByPeriodDataElmOrgUnit[key];
    if (matchingAnalytic) {
      // Analytics for the same period, data element, and org unit already exist; sum the value
      summedAnalyticsByPeriodDataElmOrgUnit[key] = {
        ...matchingAnalytic,
        value: matchingAnalytic.value + value,
      };
    } else {
      summedAnalyticsByPeriodDataElmOrgUnit[key] = { ...analytic, period: convertedPeriod };
    }
  });

  return Object.values(summedAnalyticsByPeriodDataElmOrgUnit);
};

const getPeriodOrgUnitDataElmKey = (period, orgUnit, dataElement) =>
  `${period}_${dataElement}_${orgUnit}`;
