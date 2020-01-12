import { AGGREGATION_TYPES } from '/dhis';

const countBooleanDataQuery = async ({ dataBuilderConfig, query }, dhisApi, AGGREGATION_TYPE) => {
  const { dataClasses } = dataBuilderConfig;

  const getReturnData = async ({ dataValues }) => {
    const { results } = await dhisApi.getAnalytics(
      { dataElementCodes: dataValues },
      query,
      AGGREGATION_TYPE,
    );

    if (results.length === 0) return { data: results };

    const bRtnValue =
      results.every(({ value }) => value === 0) && results.length === dataValues.length;

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

export const countBooleanData = async (queryConfig, dhisApi) =>
  countBooleanDataQuery(queryConfig, dhisApi, AGGREGATION_TYPES.SUM);
