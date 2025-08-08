import winston from 'winston';
import { DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';
import { pushAggregateData } from '/preaggregation/pushAggregateData';

const DATA_ELEMENT_GROUP_CODE_PREFIX = 'CriticalMedicines';
const ORGANISATION_UNIT_GROUP_CODE_PREFIX = 'FacilityType';
const STOCK_STATUS_CODES = {
  0: 'available',
  1: 'outOfStock',
  2: 'expired',
  3: 'expired', // Relates to 'Yes but Not Refrigerated', which gets aggregated together with expired
};
const DATA_ELEMENT_CODES = {
  available: 'PercentageCriticalMedicinesAvailable',
  outOfStock: 'PercentageCriticalMedicinesOutOfStock',
  expired: 'PercentageCriticalMedicinesExpired',
};

// LAST_12_MONTHS excludes the current month - this is intentional, to avoid misleading calculations
// based on incomplete data in the current month
const LOOKBACK_PERIOD = 'LAST_12_MONTHS';

export const criticalMedicineAvailability = async (aggregator, dhisApi) => {
  winston.info('Starting to aggregate Critical Medicine Availability');

  // Find all countries, i.e. all level 2 organisation units
  const countries = await dhisApi.getOrganisationUnits({
    filter: [{ level: 2 }],
    fields: 'code, name',
  });

  // Calculate aggregatedValues for country based on each group denominator of Critical Medicine Availability.
  for (let countryIndex = 0; countryIndex < countries.length; countryIndex++) {
    const country = countries[countryIndex];
    winston.info('Starting to process country', { country: country.name });

    let aggregatedValues = {};

    // Find denominator group for each facility type within the country.
    try {
      // Find all organisation unit groups representing facility types for this country (e.g. FacilityType_TO_1_Hospitals)
      const organisationUnitGroupCodePrefixForCountry = `${ORGANISATION_UNIT_GROUP_CODE_PREFIX}_${country.code}`;
      const { organisationUnitGroups } = await dhisApi.fetch(
        DHIS2_RESOURCE_TYPES.ORGANISATION_UNIT_GROUP,
        {
          filter: [{ code: organisationUnitGroupCodePrefixForCountry, comparator: 'like' }],
          fields: 'code',
        },
      );

      for (
        let organisationUnitGroupIndex = 0;
        organisationUnitGroupIndex < organisationUnitGroups.length;
        organisationUnitGroupIndex++
      ) {
        // Then it continues to next step: find values and facilities of group to aggregate
        const organisationUnitGroupCode = organisationUnitGroups[organisationUnitGroupIndex].code;
        const aggregatedValuesForDataElementGroup = await aggregateCriticalMedicineAvailabilityForGroup(
          aggregator,
          dhisApi,
          organisationUnitGroupCode,
        );
        aggregatedValues = {
          ...aggregatedValues,
          ...aggregatedValuesForDataElementGroup,
        };
      }

      // Send the values to the DHIS2 server
      await postAggregatedValues(aggregator, aggregatedValues);
    } catch (error) {
      winston.error('Error while calculating critical availability', { country: country.name });
    }
  }
};

const aggregateCriticalMedicineAvailabilityForGroup = async (
  aggregator,
  dhisApi,
  organisationUnitGroupCode,
) => {
  // Get the data element groups that relate to this organisation unit group
  const dataElementGroup = await getDataElementGroupForOrganisationUnitGroup(
    dhisApi,
    organisationUnitGroupCode,
  );
  if (!dataElementGroup) {
    return {}; // If there is no matching data element group, this facility is of a type that doesn't need to have critical medicines aggregated
  }
  const { dataElements: criticalMedicineDataElements } = dataElementGroup;

  try {
    const { results } = await aggregator.fetchAnalytics(
      criticalMedicineDataElements.map(de => de.code),
      {
        period: LOOKBACK_PERIOD,
        organisationUnitCode: `OU_GROUP-${organisationUnitGroupCode}`,
      },
      { aggregationType: aggregator.aggregationTypes.FINAL_EACH_MONTH_PREFER_DAILY_PERIOD },
    );

    // Store facility values of the same group in the aggregatedValues object, building up an
    // object following the structure: { organisationUnitCode: { period: { dataElementCode: count }}}
    const numberCriticalMedicines = criticalMedicineDataElements.length;
    const aggregatedValues = {};
    results.forEach(result => {
      const {
        organisationUnit: organisationUnitCode,
        period,
        dataElement: dataElementCode,
        value: stockStatusCodeIndex,
      } = result;
      const stockStatusDataElementCode = STOCK_STATUS_CODES[stockStatusCodeIndex];
      if (
        criticalMedicineDataElements.some(
          ({ code: criticalMedicineCode }) => dataElementCode === criticalMedicineCode,
        )
      ) {
        if (!aggregatedValues[organisationUnitCode]) {
          aggregatedValues[organisationUnitCode] = {};
        }
        if (!aggregatedValues[organisationUnitCode][period]) {
          aggregatedValues[organisationUnitCode][period] = {};
        }

        if (!aggregatedValues[organisationUnitCode][period][stockStatusDataElementCode]) {
          aggregatedValues[organisationUnitCode][period][stockStatusDataElementCode] = 0;
        }
        aggregatedValues[organisationUnitCode][period][stockStatusDataElementCode] +=
          1 / numberCriticalMedicines;
      }
    });

    // Recalculate PercentageCriticalMedicinesOutOfStock percentage, for dataElements with no data values
    Object.keys(aggregatedValues).forEach(organisationUnitCode => {
      Object.keys(aggregatedValues[organisationUnitCode]).forEach(period => {
        // Grab out the object representing this period for the current organisation unit. We will
        // edit this object directly, which will update within the aggregatedValues object
        const percentagesForPeriod = aggregatedValues[organisationUnitCode][period];
        percentagesForPeriod.outOfStock =
          1 - (percentagesForPeriod.available || 0) - (percentagesForPeriod.expired || 0);
        if (!percentagesForPeriod.available) {
          percentagesForPeriod.available =
            1 - percentagesForPeriod.outOfStock - (percentagesForPeriod.expired || 0);
        }
        if (!percentagesForPeriod.expired) {
          percentagesForPeriod.expired =
            1 - percentagesForPeriod.available - percentagesForPeriod.outOfStock;
        }
      });
    });

    return aggregatedValues;
  } catch (error) {
    winston.error(`Error while fetching analytics: ${error.message}`, {
      organisationUnitGroupCode,
    });
    return null;
  }
};

const postAggregatedValues = async (aggregator, aggregatedValues) => {
  const dataValues = [];
  Object.entries(aggregatedValues).forEach(([organisationUnitCode, organisationUnit]) => {
    Object.entries(organisationUnit).forEach(([period, values]) => {
      Object.entries(values).forEach(([stockStatus, value]) => {
        dataValues.push({
          code: DATA_ELEMENT_CODES[stockStatus],
          orgUnit: organisationUnitCode,
          period: period.substring(0, 6), // Ensure it saves under the monthly period, rather than a specific date (e.g. 201802 rather than 20180214)
          value: Math.round(value * 1000) / 1000,
        });
      });
    });
  });

  await pushAggregateData(aggregator, dataValues);
};

const getDataElementGroupForOrganisationUnitGroup = async (dhisApi, organisationUnitGroupCode) => {
  const [
    prefix,
    countryCode,
    facilityTypeLevel,
    facilityTypeCode,
  ] = organisationUnitGroupCode.split('_');
  const dataElementGroupCodes = [
    `${DATA_ELEMENT_GROUP_CODE_PREFIX}_${countryCode}_${facilityTypeLevel}_${facilityTypeCode}`, // Most specific, so most preferred, e.g. CriticalMedicines_TO_1_Hospitals
    `${DATA_ELEMENT_GROUP_CODE_PREFIX}_${countryCode}`, // In the case there is a country-wide basket of goods e.g. CriticalMedicines_TO
    `${DATA_ELEMENT_GROUP_CODE_PREFIX}`, // In the unusual case this country uses the generic basket of goods, e.g. CriticalMedicines
  ];
  // Go through from most specific to least specific, and return as soon as a matching group is found
  for (let i = 0; i < dataElementGroupCodes.length; i++) {
    const dataElementGroup = await dhisApi.getRecord({
      type: DHIS2_RESOURCE_TYPES.DATA_ELEMENT_GROUP,
      code: dataElementGroupCodes[i],
      fields: 'code,dataElements[code]',
    });
    if (dataElementGroup) {
      if (!dataElementGroup.dataElements || dataElementGroup.dataElements.length === 0) {
        return null;
      }
      return dataElementGroup;
    }
  }
  throw new Error(`Could not find a matching data element group for ${organisationUnitGroupCode}`);
};
