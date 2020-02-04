import { utcMoment } from '@tupaia/utils';
import { AGGREGATION_TYPES, convertDateRangeToPeriodString } from '@tupaia/dhis-api';
import { EARLIEST_DATA_DATE } from '/dhis';

export const compareValuesByDisasterDate = async (
  { dataBuilderConfig, viewJson, query },
  aggregator,
  dhisApi,
) => {
  const { organisationUnitCode, disasterStartDate, startDate } = query;
  const { dataElementCodes } = dataBuilderConfig;
  const { leftColumn, rightColumn } = viewJson.presentationOptions;
  const { MOST_RECENT } = AGGREGATION_TYPES;
  const returnData = [];

  const { results: baselineData, metadata: baselineMetadata } = await dhisApi.getAnalytics(
    {
      ...dataBuilderConfig,
      dataElementCodes,
    },
    {
      organisationUnitCode,
      period: convertDateRangeToPeriodString(
        startDate || EARLIEST_DATA_DATE,
        utcMoment(disasterStartDate).subtract(1, 'd'),
      ),
    },
    MOST_RECENT,
  );
  const { results: currentData, metadata: currentMetadata } = await dhisApi.getAnalytics(
    {
      ...dataBuilderConfig,
      dataElementCodes,
    },
    {
      organisationUnitCode,
      period: convertDateRangeToPeriodString(disasterStartDate, Date.now()),
    },
    MOST_RECENT,
  );

  const baselineDataByCode = baselineData.reduce((valuesByCode, element) => {
    const { dataElement: dataElementId, value } = element;
    const code = baselineMetadata.dataElementIdToCode[dataElementId];
    valuesByCode[code] = value; // eslint-disable-line no-param-reassign
    return valuesByCode;
  }, {});

  const currentDataByCode = currentData.reduce((valuesByCode, element) => {
    const { dataElement: dataElementId, value } = element;
    const code = currentMetadata.dataElementIdToCode[dataElementId];
    valuesByCode[code] = value; // eslint-disable-line no-param-reassign
    return valuesByCode;
  }, {});

  dataElementCodes.forEach(code => {
    const name = baselineMetadata.dataElementCodeToName[code];
    returnData.unshift({
      // we want the comparison elements to render first.
      name,
      [leftColumn.header]: baselineDataByCode[code] || '?',
      [rightColumn.header]: currentDataByCode[code] || '?',
    });
  });

  return { data: returnData };
};
