const FREQUENCY_VALUES = {
  0: 'As required',
  1: 'Daily',
  2: 'Weekly',
  3: 'Monthly',
  4: 'Quarterly',
  5: 'Not often',
};

// Routine vaccination at facility
export const frequencyDataElement = async ({ dataBuilderConfig, query }, aggregator) => {
  const { dataElementCodes, dataServices, labels } = dataBuilderConfig;
  const { results, metadata } = await aggregator.fetchAnalytics(
    dataElementCodes,
    { dataServices },
    query,
  );

  // Translate parsed analytic to [{ name: , value: }]
  const returnData = [];
  const { dataElementCodeToName } = metadata;
  results.forEach(({ dataElement: dataElementCode, value }) => {
    const returnedRow = {
      // Get the element name through explicit translation if it exists, otherwise from the response data
      name: labels[dataElementCode] || dataElementCodeToName[dataElementCode],
      value: FREQUENCY_VALUES[value],
    };
    returnData.push(returnedRow);
  });

  return { data: returnData };
};
