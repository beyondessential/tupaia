import { getFacilityStatuses } from './getFacilityStatuses';
import { getPacificFacilitiesByCountry } from './getPacificFacilitiesByCountry';

/**
 * Find all organisation units of children operational facilities given the {parentCode}
 * and will also find operational facilities by country to use to build data to charts.
 *
 * @param {String} parentCode - code for the group of parent organisation unit
 * @param {String} period - If defined, the period within facilities must have been operational
 */
export const getPacificFacilityStatuses = async (aggregator, parentCode, period) => {
  const operationalFacilities = await getFacilityStatuses(aggregator, parentCode, period);

  // Find and add country codes
  const countriesChildren = await getPacificFacilitiesByCountry();
  countriesChildren.forEach(({ code: countryCode, children: facilitiesInCountry }) => {
    facilitiesInCountry.forEach(({ code: facilityCode }) => {
      if (operationalFacilities[facilityCode]) {
        operationalFacilities[facilityCode].countryCode = countryCode;
      }
    });
  });
  return operationalFacilities;
};
