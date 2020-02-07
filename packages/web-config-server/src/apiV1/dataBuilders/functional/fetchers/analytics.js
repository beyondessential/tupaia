export const basicFetch = async ({ dataBuilderConfig, query, organisationUnitInfo, dhisApi }) => {
  const { results } = await dhisApi.getAnalytics(dataBuilderConfig, query);
  return results;
};
