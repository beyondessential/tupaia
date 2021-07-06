import { getFacilityStatusCounts } from '/apiV1/utils';

export const countOperationalFacilities = async ({ query }, aggregator) => {
  const { numberOperational, total } = await getFacilityStatusCounts(
    aggregator,
    query.organisationUnitCode,
  );
  return {
    data: [
      {
        value: numberOperational,
        total,
      },
    ],
  };
};
