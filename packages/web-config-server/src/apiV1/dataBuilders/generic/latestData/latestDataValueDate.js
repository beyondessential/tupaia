export const latestDataValueDate = async (
  { dataBuilderConfig, entity },
  aggregator,
  dhisApi,
) => {
  const dataValues = await dhisApi.getDataValuesInSets(dataBuilderConfig, entity);
  const dateJson = {
    viewType: 'singleDate',
    name: dataBuilderConfig.name,
    value: findLatestDate(dataValues),
  };

  return { data: [dateJson] };
};

const findLatestDate = dataValues => {
  if (!dataValues) return null;
  return dataValues.reduce((collector, dataValue) => {
    // select latest
    const currentDate = new Date(dataValue.value);
    if (!collector) return currentDate;
    return currentDate > collector ? currentDate : collector;
  }, null);
};
