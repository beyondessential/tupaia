export const evaluateAllTrue = async ({ dataBuilderConfig, query }, dhisApi) => {
  const { dataClasses } = dataBuilderConfig;

  const getReturnData = async ({ dataValues }) => {
    const { results } = await dhisApi.getAnalytics({ dataElementCodes: dataValues }, query);

    return results.every(({ value }) => value === 1) && results.length === dataValues.length;
  };

  const dataTasks = Object.entries(dataClasses).map(async ([key, value]) => {
    const dataResponse = await getReturnData(value);

    return {
      name: key,
      value: dataResponse,
    };
  });

  const data = await Promise.all(dataTasks);
  return { data };
};
