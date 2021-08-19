/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import flatten from 'lodash.flatten';
import winston from 'winston';

import {
  utcMoment,
  reduceToDictionary,
  stripFromString,
  PERIOD_TYPES,
  momentToPeriod,
} from '@tupaia/utils';
import { getDataElementGroups } from '/apiV1/utils';
import {
  FRIDGE_BREACH_PROGRAM_CODE,
  FRIDGE_DAILY_PROGRAM_CODE,
  WORLD,
} from './vaccineFridgeConstants';

const { DAY } = PERIOD_TYPES;
const LOOKBACK_DAYS = 31;

const prependString = 'PREAGGREGATED_';
const preaggregatedDataElementCode = dataElementCode => `${prependString}${dataElementCode}`;
const orgUnitVaccineListCode = orgUnit => `${orgUnit}_vaccine_list`;

const fetchFridgeData = async aggregator => {
  const fetchConfig = {
    organisationUnitCodes: [WORLD],
    startDate: utcMoment().subtract(LOOKBACK_DAYS, 'days').format(),
    endDate: utcMoment().format(),
    useDeprecatedApi: true,
  };

  const breachEvents = await aggregator.fetchEvents(FRIDGE_BREACH_PROGRAM_CODE, fetchConfig);
  const dailyFridgeDataEvents = await aggregator.fetchEvents(
    FRIDGE_DAILY_PROGRAM_CODE,
    fetchConfig,
  );

  return [...breachEvents, ...dailyFridgeDataEvents];
};

const buildVaccineMetadata = async (aggregator, dhisApi, data) => {
  const metadataByFacility = reduceToDictionary(data, 'orgUnit', 'orgUnit');
  const vaccineListCodes = Object.values(metadataByFacility).map(orgUnit =>
    orgUnitVaccineListCode(orgUnit),
  );
  const orgUnitVaccineLists = await getDataElementGroups(dhisApi, vaccineListCodes);

  const metadata = {};
  Object.keys(metadataByFacility).forEach(facilityCode => {
    const facilityVaccineListCode = orgUnitVaccineListCode(facilityCode);
    if (!orgUnitVaccineLists[facilityVaccineListCode]) return;

    const originalDataElementCodes = orgUnitVaccineLists[
      facilityVaccineListCode
    ].dataElements.map(de => stripFromString(de.code, prependString));

    metadata[facilityCode] = originalDataElementCodes.reduce((originalToPreaggregated, code) => {
      return {
        ...originalToPreaggregated,
        [code]: preaggregatedDataElementCode(code),
      };
    }, {});
  });

  return metadata;
};

const buildDataValues = (metadata, data) => {
  const dataValuesByOrgUnit = {};
  data.forEach(event => {
    const metadataForOrgUnit = metadata[event.orgUnit];
    // If there's no vaccine list set up on dhis2 for this org unit,
    // we assume it is safe to ignore.
    if (!metadataForOrgUnit) return;

    const existingEvent = dataValuesByOrgUnit[event.orgUnit];
    if (!existingEvent || existingEvent.period < event.eventDate) {
      const newData = Object.keys(event.dataValues)
        .filter(dataElement => metadataForOrgUnit[dataElement])
        .map(dataElement => ({
          code: metadataForOrgUnit[dataElement],
          period: momentToPeriod(utcMoment(event.eventDate), DAY),
          orgUnit: event.orgUnit,
          value: event.dataValues[dataElement],
        }));

      dataValuesByOrgUnit[event.orgUnit] = { period: event.eventDate, data: newData };
    }
  });

  return flatten(Object.values(dataValuesByOrgUnit).map(x => x.data));
};

export const vaccineStockOnHand = async (aggregator, dhisApi) => {
  winston.info('Starting vaccine stock on hand aggregation');

  const fridgeData = await fetchFridgeData(aggregator);
  winston.info('Finished fetching fridge data: building data...');

  const metadata = await buildVaccineMetadata(aggregator, dhisApi, fridgeData);
  const dataValues = buildDataValues(metadata, fridgeData);

  if (dataValues.length === 0) {
    winston.info('No new data to import');
    return;
  }

  const {
    counts: { imported, updated, ignored },
  } = await aggregator.pushAggregateData(dataValues);

  if (imported) {
    winston.info(`${imported} data values imported successfully`);
  }
  if (updated) {
    winston.info(`${updated} data values updated successfully`);
  }
  if (ignored) {
    winston.warn(`${ignored} data values ignored`);
  }
};
