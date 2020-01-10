import { AGGREGATION_TYPES } from '/dhis';
import { sumResults } from '/apiV1/utils';

const countBooleanDataQuery = async ({ dataBuilderConfig, query }, dhisApi, AGGREGATION_TYPE) => {
  const { dataClasses } = dataBuilderConfig;

  const getReturnData = async dataValues => {
    const { results } = await dhisApi.getAnalytics(
      { dataElementCodes: dataValues },
      query,
      AGGREGATION_TYPE,
    );

    console.log(results);
    if (results.length === 0) return { data: results };

    const bRtnValue =
      results.every(({ value }) => value === 0) && results.length === dataValues.length;

    return bRtnValue;
  };

  const data = Object.entries(dataClasses).map(async ([key, value]) => {
    const t = await getReturnData(value);

    return {
      name: key,
      value: t,
    };
  });

  const b = Promise.all([data]);
  console.log(b);
  return { data: [] };
};

export const countBooleanData = async (queryConfig, dhisApi) =>
  countBooleanDataQuery(queryConfig, dhisApi, AGGREGATION_TYPES.SUM);
