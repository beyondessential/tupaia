const NO_UNIQUE_VALUE = 'NO_UNIQUE_VALUE';

export const uniqueValueFromEvents = (events, config) => {
  const { valueToSelect } = config;
  let uniqueValue;
  for (const event of events) {
    const eventValue = event.dataValues[valueToSelect];
    if (!uniqueValue) {
      uniqueValue = eventValue;
    } else if (eventValue && uniqueValue !== eventValue) {
      return NO_UNIQUE_VALUE;
    }
  }
  return uniqueValue;
};
