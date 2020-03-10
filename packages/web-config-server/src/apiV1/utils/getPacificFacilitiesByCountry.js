import { DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';
import { getDhisApiInstance } from '/dhis';

// Find every organisation units that are children of a country (will return facilities, district and sub-districts)
const getFacilitiesWithinParent = async (dhisApi, countryCode) =>
  dhisApi.getOrganisationUnits({
    filter: [
      { 'ancestors.code': countryCode },
      { description: '"level":"Facility"', comparator: 'like' },
    ],
    fields: ['id', 'displayName', 'code'],
  });

// Get Pacific countries current in Tupaia
const getPacificCountries = async dhisApi => {
  // Query DHIS2 organisationUnitGroups with code: Countries
  const { organisationUnitGroups } = await dhisApi.fetch(
    DHIS2_RESOURCE_TYPES.ORGANISATION_UNIT_GROUP,
    {
      filter: [{ code: 'Pacific_Countries' }],
      fields: 'organisationUnits[code, name]',
    },
  );
  return organisationUnitGroups[0];
};

export const getPacificFacilitiesByCountry = async () => {
  const dhisApi = getDhisApiInstance(); // Always use the regional DHIS2 server for facility information
  const countriesAndChildren = [];
  const countries = await getPacificCountries(dhisApi);
  await Promise.all(
    countries.organisationUnits.map(async country => {
      const countryFacilities = await getFacilitiesWithinParent(dhisApi, country.code);
      countriesAndChildren.push({
        code: country.code,
        children: countryFacilities,
      });
    }),
  );
  return countriesAndChildren;
};
