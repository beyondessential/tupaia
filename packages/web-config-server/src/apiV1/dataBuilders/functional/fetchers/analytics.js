import { getDataElementsInGroup } from '/apiV1/utils/getDataElementsInGroup';

export const fetchAnalytics = async ({ result, context }) => {
  const { query, aggregator } = context;
  const { results } = await aggregator.fetchAnalytics(result, {}, query);
  return results;
};

export const fetchDataElementCodesFromGroup = async context => {
  const { dataBuilderConfig, dhisApi } = context;
  const dataElements = await getDataElementsInGroup(
    dhisApi,
    dataBuilderConfig.dataElementGroupCode,
    true,
  );
  return { result: Object.keys(dataElements), context };
};
