const evaluateAllTrueQuery = async ({ dataBuilderConfig, query }, dhisApi) => {
  const { dataClasses } = dataBuilderConfig;

  const getReturnData = async ({ dataValues }) => {
    const { results } = await dhisApi.getAnalytics({ dataElementCodes: dataValues }, query);

    const bRtnValue =
      results.every(({ value }) => value === 1) && results.length === dataValues.length;

    return bRtnValue;
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

export const evaluateAllTrue = async (queryConfig, dhisApi) =>
  evaluateAllTrueQuery(queryConfig, dhisApi);
