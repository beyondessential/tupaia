import { getFacilityStatusCounts } from '/apiV1/utils';
// Number of operational faciiticies
export const countOperationalFacilities = async ({ query }) => {
  const { numberOperational, total } = await getFacilityStatusCounts(query.organisationUnitCode);
  return {
    value: numberOperational,
    total,
  };
};
