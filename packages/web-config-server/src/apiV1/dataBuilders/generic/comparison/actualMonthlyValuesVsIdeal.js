import { utcMoment } from '@tupaia/tsutils';
import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';
import { regexLabel } from '/apiV1/utils';

/* historical data within a matrix format compared to an 'Ideal' Value */
export const actualMonthlyValuesVsIdeal = async ({ dataBuilderConfig, query }, aggregator) => {
  const { pairs, labelRegex, dataServices } = dataBuilderConfig;

  // Function to fetch analytics for a metric
  const fetchAnalytics = async metric => {
    const { results: idealResults, metadata: idealMetadata } = await aggregator.fetchAnalytics(
      metric.idealDataElementCodes,
      { dataServices },
      query,
    );
    const { results: actualResults } = await aggregator.fetchAnalytics(
      metric.actualDataElementCodes,
      { dataServices },
      query,
      aggregator.aggregationTypes.FINAL_EACH_MONTH,
    );
    return {
      idealResults,
      actualResults,
      idealMetadata,
    };
  };

  const metric = {
    key: 'value',
    actualDataElementCodes: Object.keys(pairs),
    idealDataElementCodes: Object.values(pairs),
  };
  const { actualResults, idealResults, idealMetadata } = await fetchAnalytics(metric);
  const finalResult = {};
  finalResult.labels = {};
  Object.keys(idealMetadata.dataElementCodeToName).forEach(key => {
    finalResult.labels[key] = regexLabel(idealMetadata.dataElementCodeToName[key], labelRegex);
  });

  finalResult.columns = actualResults
    .map(({ period }) => period)
    .filter((period, index, array) => array.indexOf(period) === index)
    .sort((period1, period2) => period2 - period1)
    .map(period => ({
      title: utcMoment(period.toString()).format('Do MMM YYYY'),
      key: period,
    }));

  // need the first column to be ideal
  finalResult.columns.unshift({
    title: 'Ideal',
    key: 'ideal',
  });

  // build a hash table with values
  const getResultKey = (columnKey, dataElementCode) => {
    if (columnKey === undefined || dataElementCode === undefined) {
      return null;
    }
    return `${columnKey}_${dataElementCode}`;
  };
  const valueHashtable = {};
  idealResults.forEach(({ dataElement: dataElementCode, value }) => {
    valueHashtable[getResultKey('ideal', dataElementCode)] = value;
  });
  actualResults.forEach(({ dataElement: actualDataElementCode, period, value }) => {
    const idealDataElementCode = pairs[actualDataElementCode];
    valueHashtable[getResultKey(period, idealDataElementCode)] = value;
  });

  finalResult.rows = [];

  Object.keys(finalResult.labels).forEach(dataElementCode => {
    const row = {
      dataElement: finalResult.labels[dataElementCode],
    };
    finalResult.columns.forEach(({ key }) => {
      const value = valueHashtable[getResultKey(key, dataElementCode)];
      row[key] = value !== undefined ? value : NO_DATA_AVAILABLE;
    });
    finalResult.rows.push(row);
  });

  return finalResult;
};
