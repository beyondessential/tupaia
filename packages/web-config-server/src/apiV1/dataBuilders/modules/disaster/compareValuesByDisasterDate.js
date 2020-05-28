import { convertDateRangeToPeriodString, utcMoment, reduceToDictionary } from '@tupaia/utils';
import { EARLIEST_DATA_DATE } from '/utils';

export const compareValuesByDisasterDate = async (
  { dataBuilderConfig, viewJson, query },
  aggregator,
) => {
  const { disasterStartDate, startDate } = query;
  const { dataElementCodes, dataServices } = dataBuilderConfig;
  const { leftColumn, rightColumn } = viewJson.presentationOptions;
  const returnData = [];

  const { results: baselineData, metadata: baselineMetadata } = await aggregator.fetchAnalytics(
    dataElementCodes,
    {
      dataServices,
      period: convertDateRangeToPeriodString(
        startDate || EARLIEST_DATA_DATE,
        utcMoment(disasterStartDate).subtract(1, 'd'),
      ),
    },
  );
  const { results: currentData } = await aggregator.fetchAnalytics(dataElementCodes, {
    dataServices,
    period: convertDateRangeToPeriodString(disasterStartDate, Date.now()),
  });

  const baselineDataByCode = reduceToDictionary(baselineData, 'dataElement', 'value');
  const currentDataByCode = reduceToDictionary(currentData, 'dataElement', 'value');

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
