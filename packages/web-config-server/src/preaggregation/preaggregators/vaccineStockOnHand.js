/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import flatten from 'lodash.flatten';
import { keyBy } from 'lodash.keyby';
import winston from 'winston';

import { PERIOD_TYPES, momentToPeriod } from '@tupaia/dhis-api';
import { utcMoment, reduceToDictionary, stripFromStart } from '@tupaia/utils';
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

const fetchFridgeData = async dhisApi => {
  const fetchConfig = {
    organisationUnitCode: WORLD,
    startDate: utcMoment()
      .subtract(LOOKBACK_DAYS, 'days')
      .format(),
    endDate: utcMoment().format(),
  };

  const breachEvents = await dhisApi.getEvents({
    programCode: FRIDGE_BREACH_PROGRAM_CODE,
    ...fetchConfig,
  });
  const dailyFridgeDataEvents = await dhisApi.getEvents({
    programCode: FRIDGE_DAILY_PROGRAM_CODE,
    ...fetchConfig,
  });

  return [...breachEvents, ...dailyFridgeDataEvents];
};

const buildVaccineMetadata = async (dhisApi, data) => {
  const metadataByFacility = reduceToDictionary(data, 'orgUnit', 'orgUnit');
  const vaccineListCodes = Object.values(metadataByFacility).map(orgUnit =>
    orgUnitVaccineListCode(orgUnit),
  );
  const orgUnitVaccineLists = await getDataElementGroups(dhisApi, vaccineListCodes);

  const metadata = {};
  for (const facility in metadataByFacility) {
    const facilityVaccineListCode = orgUnitVaccineListCode(facility);
    if (!orgUnitVaccineLists[facilityVaccineListCode]) continue;

    const originalDataElementCodes = orgUnitVaccineLists[
      facilityVaccineListCode
    ].dataElements.map(de => stripFromStart(de.code, prependString));
    const originalDataElements = await aggregator.fetchDataElements(originalDataElementCodes, {
      organisationUnitCode: WORLD,
    });
    const originalDataElementByCode = keyBy(originalDataElements, 'code');

    metadata[facility] = originalDataElementCodes.reduce((codesById, code) => {
      return {
        ...codesById,
        [originalDataElementByCode[code].id]: preaggregatedDataElementCode(code),
      };
    }, {});
  }

  return metadata;
};

const buildDataValues = (metadata, data) => {
  const dataValuesByOrgUnit = {};
  for (const event of data) {
    const metadataForOrgUnit = metadata[event.orgUnit];
    // If there's no vaccine list set up on dhis2 for this org unit,
    // we assume it is safe to ignore.
    if (!metadataForOrgUnit) continue;

    const existingEvent = dataValuesByOrgUnit[event.orgUnit];
    if (!existingEvent || existingEvent.period < event.eventDate) {
      const newData = event.dataValues
        .filter(value => metadataForOrgUnit[value.dataElement])
        .map(value => ({
          dataElement: metadataForOrgUnit[value.dataElement],
          period: momentToPeriod(utcMoment(event.eventDate), DAY),
          orgUnit: event.orgUnit,
          value: value.value,
        }));

      dataValuesByOrgUnit[event.orgUnit] = { period: event.eventDate, data: newData };
    }
  }

  return flatten(Object.values(dataValuesByOrgUnit).map(x => x.data));
};

export const vaccineStockOnHand = async (aggregator, dhisApi) => {
  winston.info('Starting vaccine stock on hand aggregation');

  const fridgeData = await fetchFridgeData(dhisApi);
  winston.info('Finished fetching fridge data: building data...');

  const metadata = await buildVaccineMetadata(dhisApi, fridgeData);
  const dataValues = buildDataValues(metadata, fridgeData);

  const {
    counts: { imported, updated, ignored },
  } = await dhisApi.postDataValueSets(dataValues);

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
