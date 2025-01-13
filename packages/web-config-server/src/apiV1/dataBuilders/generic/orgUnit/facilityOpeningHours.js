const SORTED_WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const facilityOpeningHours = async ({ dataBuilderConfig, query }, aggregator) => {
  const { dataElementCodes: nestedDataElementCodes, dataServices } = dataBuilderConfig;
  const dataElementCodes = Object.values(nestedDataElementCodes).flat();
  const { results } = await aggregator.fetchAnalytics(dataElementCodes, { dataServices }, query);
  const resultsCodeToValue = Object.fromEntries(results.map(row => [[row.dataElement], row.value]));

  const openingHours = {};
  Object.entries(nestedDataElementCodes).forEach(([day, codes]) => {
    // one data element for 'is open?', three data elements for 'is open?', 'Open time',and 'Close time'
    if (![1, 3].includes(codes.length))
      throw new Error(
        `Invalid data builder config, please provide either one or three data elements on ${day}'s config`,
      );

    const IS_OPEN_CODE = codes[0];
    if (
      resultsCodeToValue[IS_OPEN_CODE] === null ||
      resultsCodeToValue[IS_OPEN_CODE] === undefined
    ) {
      openingHours[day] = 'No Data';
      return;
    }
    if (['Yes', 1].includes(resultsCodeToValue[IS_OPEN_CODE])) {
      const openingTime = codes[1] && resultsCodeToValue[codes[1]];
      const closingTime = codes[2] && resultsCodeToValue[codes[2]];
      if (openingTime && closingTime) {
        openingHours[day] =
          openingTime === closingTime ? 'open 24 hours' : `${openingTime} - ${closingTime}`;
      } else {
        openingHours[day] = 'Open (unknown time)';
      }
    } else {
      openingHours[day] = 'Closed';
    }
  });

  const returnData = SORTED_WEEKDAYS.map(day => ({
    value: openingHours[day],
    name: day,
  }));

  return { data: returnData };
};
