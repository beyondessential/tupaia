/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';
import keyBy from 'lodash.keyby';
import winston from 'winston';
import { getSortByKey, reduceToDictionary } from '@tupaia/utils';
import { DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';

import {
  WORLD,
  FRIDGE_DAILY_PROGRAM_CODE,
  FRIDGE_BREACH_PROGRAM_CODE,
  FRIDGE_THRESHOLD_MAX,
  FRIDGE_THRESHOLD_MIN,
  FRIDGE_HOT_BREACH_TEMP,
  FRIDGE_COLD_BREACH_TEMP,
  FRIDGE_SOH_VALUE,
  FRIDGE_BREACH_START_TIME,
  FRIDGE_BREACH_END_TIME,
  FRIDGE_BREACH_MINS,
} from './vaccineFridgeConstants';

/**
 * Example:
 * ```
 * {
 *   eventDate: '2019-05-26T10:53:15',
 *   FRIDGE_BREACH_MINS: 40,
 *   FRIDGE_BREACH_START_TIME: '2019-05-26T10:13:15',
 *   FRIDGE_BREACH_END_TIME: '2019-05-26T10:53:15',
 *   FRIDGE_HOT_BREACH_TEMP: 12.3,
 *   FRIDGE_SOH_VALUE: 100,
 * }
 * ```
 *
 * @typedef {Object} Readings
 * @property {string} eventDate
 * @property {string} FRIDGE_BREACH_MINS
 * @property {string} FRIDGE_BREACH_START_TIME
 * @property {string} [FRIDGE_BREACH_END_TIME]
 * @property {string} [FRIDGE_HOT_BREACH_TEMP]
 * @property {string} [FRIDGE_COLD_BREACH_TEMP]
 * @property {string} [FRIDGE_SOH_VALUE]
 */

const AGGREGATION_NAME = 'IMMS Fridge Breaches';

const FRIDGE_BREACH_ELEMENT_CODES = {
  FRIDGE_HOT_BREACH_TEMP,
  FRIDGE_COLD_BREACH_TEMP,
  FRIDGE_SOH_VALUE,
  FRIDGE_BREACH_START_TIME,
  FRIDGE_BREACH_END_TIME,
  FRIDGE_BREACH_MINS,
};

/**
 * Codes for mSupply Fridge Breach Preaggregated Data (output)
 */
const FRIDGE_BREACH_AGR_PROGRAM_CODE = 'FRIDGE_BREACH_PREAGGREGATED';

const BREACH_TEMP = 'BREACH_TEMP';
const BREACH_SOH_VALUE = 'BREACH_SOH_VALUE';
const BREACH_START_TIME = 'BREACH_START_TIME';
const BREACH_END_TIME = 'BREACH_END_TIME';
const BREACH_MINS = 'BREACH_MINS';

export const FRIDGE_BREACH_AGR_ELEMENT_CODES = {
  BREACH_TEMP,
  BREACH_SOH_VALUE,
  BREACH_START_TIME,
  BREACH_END_TIME,
  BREACH_MINS,
};

class FridgeBreachAggregator {
  constructor(aggregator, dhisApi) {
    this.aggregator = aggregator;
    this.dhisApi = dhisApi;
  }

  async aggregate(events) {
    const eventsByOrgUnit = groupBy(events, 'orgUnit');
    const dataElementCodeToId = await this.getDataElementCodeToId();
    const thresholdTempByOrgUnit = await this.getThresholdTemperaturesByOrgUnit();
    const targetProgramId = await this.dhisApi.getIdFromCode(
      DHIS2_RESOURCE_TYPES.PROGRAM,
      FRIDGE_BREACH_AGR_PROGRAM_CODE,
    );

    const aggregatedEvents = [];
    Object.values(eventsByOrgUnit).forEach(eventsForOrgUnit => {
      const organisationUnitId = eventsForOrgUnit[0].orgUnit;
      const thresholdTemperatures = thresholdTempByOrgUnit[organisationUnitId];
      if (!thresholdTemperatures) {
        winston.warn(
          `No ${FRIDGE_THRESHOLD_MIN}, ${FRIDGE_THRESHOLD_MAX} values found for organisation unit ${organisationUnitId}, skipping`,
        );
        return;
      }
      const readings = this.getSortedBreachReadings(eventsForOrgUnit);

      readings.forEach(readingsForBreach => {
        const dataValues = Object.values(FRIDGE_BREACH_AGR_ELEMENT_CODES).map(code => ({
          dataElement: dataElementCodeToId[code],
          value: this.calculateDataValue(code, readingsForBreach, thresholdTemperatures),
        }));

        aggregatedEvents.push({
          program: targetProgramId,
          orgUnit: organisationUnitId,
          eventDate: readingsForBreach[0][FRIDGE_BREACH_START_TIME],
          dataValues,
        });
      });
    });

    return aggregatedEvents;
  }

  /**
   * A map of data element code to id for all data elements of interest
   *
   * @returns {Promise<Object<string, string>>}
   */
  async getDataElementCodeToId() {
    const codes = Object.values(FRIDGE_BREACH_ELEMENT_CODES).concat(
      Object.values(FRIDGE_BREACH_AGR_ELEMENT_CODES),
    );
    const dataElements = await this.aggregator.fetchDataElements(codes, {
      organisationUnitCode: WORLD,
    });

    return reduceToDictionary(dataElements, 'code', 'id');
  }

  /**
   * @returns {Promise<Object<string, { min: number, max: number }>>} A map of organisationUnitCode to
   * threshold temperatures
   */
  async getThresholdTemperaturesByOrgUnit() {
    const { results } = await this.aggregator.fetchAnalytics(
      [FRIDGE_THRESHOLD_MIN, FRIDGE_THRESHOLD_MAX],
      {
        programCodes: [FRIDGE_DAILY_PROGRAM_CODE],
        organisationUnitCode: WORLD,
      },
    );
    const analyticsByOrgUnit = groupBy(results, 'organisationUnit');

    const temperaturesByOrgUnit = {};
    Object.entries(analyticsByOrgUnit).forEach(([orgUnitCode, analyticsForOrgUnit]) => {
      temperaturesByOrgUnit[orgUnitCode] = {};

      analyticsForOrgUnit.forEach(({ dataElement: dataElementCode, value }) => {
        temperaturesByOrgUnit[orgUnitCode][dataElementCode] = value;
      });
    });

    return temperaturesByOrgUnit;
  }

  /**
   * @param {Object[]} orgUnitEvents
   * @returns {Readings[][]} An array of reading groups, sorted by their `eventDate`. Each group of
   * readings constitutes a breach
   */
  getSortedBreachReadings = orgUnitEvents => {
    const allReadings = orgUnitEvents.map(event => this.getReadingsForEvent(event));
    const groupedReadings = Object.values(groupBy(allReadings, FRIDGE_BREACH_START_TIME));
    groupedReadings.forEach(readingsForBreach => readingsForBreach.sort(getSortByKey('eventDate')));

    return groupedReadings;
  };

  getReadingsForEvent = event => {
    const { eventDate, dataValues } = event;

    const readings = { eventDate };
    Object.entries(dataValues).forEach(([dataElementCode, value]) => {
      if (!Object.values(FRIDGE_BREACH_ELEMENT_CODES).includes(dataElementCode)) {
        return;
      }
      readings[dataElementCode] = value;
    });

    return readings;
  };

  calculateDataValue = (aggregatedElementCode, readings, thresholdTemperatures) => {
    switch (aggregatedElementCode) {
      case BREACH_TEMP: {
        const readingTemperatures = readings.map(
          reading => reading[FRIDGE_HOT_BREACH_TEMP] || reading[FRIDGE_COLD_BREACH_TEMP],
        );
        const readingMax = Math.max(...readingTemperatures);

        return readingMax > thresholdTemperatures[FRIDGE_THRESHOLD_MAX]
          ? readingMax
          : Math.min(...readingTemperatures);
      }
      case BREACH_SOH_VALUE:
        return readings[0][FRIDGE_SOH_VALUE];
      case BREACH_START_TIME:
        return readings[0][FRIDGE_BREACH_START_TIME];
      case BREACH_END_TIME:
        return readings[readings.length - 1][FRIDGE_BREACH_END_TIME] || '';
      case BREACH_MINS:
        return readings[readings.length - 1][FRIDGE_BREACH_MINS];
      default:
        throw new Error(
          `Unknown data element code ${aggregatedElementCode} for ${FRIDGE_BREACH_AGR_PROGRAM_CODE}`,
        );
    }
  };
}

class AggregatedEventPusher {
  constructor(aggregator, dhisApi) {
    this.aggregator = aggregator;
    this.dhisApi = dhisApi;
  }

  async push(newEvents) {
    const existingEvents = await getEvents(this.aggregator, FRIDGE_BREACH_AGR_PROGRAM_CODE);
    const existingEventsByKey = keyBy(existingEvents, this.getEventKey);

    const eventsToImport = [];
    const eventsToUpdate = [];
    newEvents.forEach(event => {
      const key = this.getEventKey(event);
      const existingEvent = existingEventsByKey[key];

      if (existingEvent) {
        // Include all existing fields for updated events so that they won't be removed
        eventsToUpdate.push({ ...existingEvent, ...event });
      } else {
        eventsToImport.push(event);
      }
    });

    await this.import(eventsToImport);
    return this.update(eventsToUpdate);
  }

  /**
   * @param {Object} event
   * @returns {string} A organisation unit & event date combination that uniquely identifies an event
   */
  getEventKey = event => {
    const { orgUnit, eventDate } = event;

    // Event date may contain a millisecond part, eg `2019-01-01T00:00:00.000`, ignore it
    return `${orgUnit}-${eventDate.substr(0, '2019-01-01T00:00:00'.length)}`;
  };

  async import(events) {
    winston.info('Importing new events...');

    let importedCount = 0;
    try {
      // TODO postEvents should be going via data-broker when preaggregation is handled by @tupaia/aggregator
      const { counts } = await this.dhisApi.postEvents(events);
      importedCount = counts.imported;
    } catch (error) {
      winston.error(error);
    }

    const message =
      importedCount === 1
        ? `${importedCount} event was imported`
        : `${importedCount} events were imported`;
    winston.info(message);
  }

  async update(events) {
    winston.info('Updating existing events...');

    // TODO updateEvents should be going via data-broker when preaggregation is handled by @tupaia/aggregator
    const { counts, errors } = await this.dhisApi.updateEvents(events);
    const { updated: updatedCount } = counts;
    errors.forEach(({ message }) => winston.error(message));

    const message =
      updatedCount === 1
        ? `${updatedCount} event was updated`
        : `${updatedCount} events were updated`;
    winston.info(message);
  }
}

const getEvents = async (aggregator, programCode) =>
  aggregator.fetchEvents(programCode, { organisationUnitCode: WORLD, useDeprecatedApi: true });

export const immsFridgeBreaches = async (aggregator, dhisApi) => {
  winston.info(`Starting to aggregate ${AGGREGATION_NAME}`);

  const events = await getEvents(aggregator, FRIDGE_BREACH_PROGRAM_CODE);
  if (events.length === 0) {
    winston.info('No breaches found, skipping aggregation');
    return false;
  }

  const breachAggregator = new FridgeBreachAggregator(aggregator, dhisApi);
  const aggregatedEvents = await breachAggregator.aggregate(events);

  winston.info(`${AGGREGATION_NAME} aggregation done, pushing`);
  const pusher = new AggregatedEventPusher(aggregator, dhisApi);
  return pusher.push(aggregatedEvents);
};
