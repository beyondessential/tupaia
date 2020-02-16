const countriesCentralStores = {
  DL: 'DL_11',
  KI: 'KI_GEN',
  SB: 'SB_500092',
  TO: 'TO_CPMS',
};

// Total stock value in central store
export const totalStockValue = async ({ dataBuilderConfig, query }, aggregator) => {
  const { dataElementCodes, dataServices } = dataBuilderConfig;
  const { organisationUnitCode } = query;
  const { results } = await aggregator.fetchAnalytics(
    dataElementCodes,
    { dataServices },
    {
      // If the query is for country, use the central store as the organisation unit
      organisationUnitCode: countriesCentralStores[organisationUnitCode] || organisationUnitCode,
    },
  );
  // return the newest record
  if (results.length > 0) {
    return { data: results };
  }
  return { data: [] };
};
