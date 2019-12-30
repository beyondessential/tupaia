export const findLatestPeriod = dataValues => {
  if (!dataValues) return null;

  let latestPeriod;
  let latestDate;
  dataValues.forEach(({ value, period }) => {
    const currentDate = new Date(value);
    if (latestDate && latestDate >= currentDate) return;

    latestPeriod = period;
    latestDate = currentDate;
  });

  return latestPeriod;
};
