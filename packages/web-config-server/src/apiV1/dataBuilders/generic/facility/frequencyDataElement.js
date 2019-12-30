const FREQUENCY_VALUES = {
  0: 'As required',
  1: 'Daily',
  2: 'Weekly',
  3: 'Monthly',
  4: 'Quarterly',
  5: 'Not often',
};

// Routine vaccination at facility
export const frequencyDataElement = async ({ dataBuilderConfig, query }, dhisApi) => {
  const { labels, ...restOfDataBuilderConfig } = dataBuilderConfig;
  const { results, metadata } = await dhisApi.getAnalytics(restOfDataBuilderConfig, query);

  // Translate parsed analytic to [{ name: , value: }]
  const returnData = [];
  const { dataElementIdToCode, dataElementCodeToName } = metadata;
  results.forEach(({ dataElement: dataElementId, value }) => {
    const dataElementCode = dataElementIdToCode[dataElementId];
    const returnedRow = {
      // Get the element name through explicit translation if it exists, otherwise from the response data
      name: labels[dataElementCode] || dataElementCodeToName[dataElementCode],
      value: FREQUENCY_VALUES[value],
    };
    returnData.push(returnedRow);
  });

  return { data: returnData };
};
