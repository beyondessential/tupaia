import { getPacificFacilityStatuses } from '/apiV1/utils';
import { getCountryNameFromCode } from '/utils';

export const countOperationalFacilitiesByCountry = async ({ query }) => {
  const operationalFacilities = await getPacificFacilityStatuses(
    query.organisationUnitCode,
    query.period,
  );

  const countryCodeIndexes = {};
  const operationalFacilityCounts = [];
  Object.values(operationalFacilities).forEach(({ countryCode }) => {
    if (!countryCode) {
      // This facility is not in a country we care about, e.g. Demo Land
      return;
    }
    if (countryCodeIndexes[countryCode] === undefined) {
      countryCodeIndexes[countryCode] = operationalFacilityCounts.length;
      operationalFacilityCounts.push({
        name: getCountryNameFromCode(countryCode),
        value: 0,
      });
    }
    const indexForCountry = countryCodeIndexes[countryCode];
    operationalFacilityCounts[indexForCountry].value++;
  });

  // Return the result array sorted by country name
  return {
    data: operationalFacilityCounts.sort((one, two) => {
      if (one.name < two.name) return -1;
      if (one.name > two.name) return 1;
      return 0;
    }),
  };
};
