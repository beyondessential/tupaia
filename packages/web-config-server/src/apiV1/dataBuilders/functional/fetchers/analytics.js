import { getDataElementsInGroup } from '/apiV1/utils/getDataElementsInGroup';

export const fetchAnalytics = async (codes, context) => {
  const { query, aggregator } = context;
  const { results } = await aggregator.fetchAnalytics(codes, {}, query);
  return results;
};

export const fetchDataElementCodesFromGroup = async (_, context) => {
  const { dataBuilderConfig, dhisApi } = context;
  const dataElements = await getDataElementsInGroup(
    dhisApi,
    dataBuilderConfig.dataElementGroupCode,
    true,
  );
  return Object.keys(dataElements);
};
