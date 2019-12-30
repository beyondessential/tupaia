import { getOptionSetOptions } from '/apiV1/utils';

export const villagesServicedByFacility = async ({ entity }, dhisApi) => {
  const code = `${entity.code}_villages`;

  try {
    const options = await getOptionSetOptions(dhisApi, { code });
    const returnData = Object.values(options).map(option => ({ value: option }));
    return { data: returnData };
  } catch (error) {
    return { data: [] };
  }
};
