export const villagesServicedByFacility = async ({ entity }, aggregator, dhisApi) => {
  const code = `${entity.code}_villages`;

  try {
    const options = await dhisApi.getOptionSetOptions({ code });
    const returnData = Object.values(options).map(option => ({ value: option }));
    return { data: returnData };
  } catch (error) {
    return { data: [] };
  }
};
