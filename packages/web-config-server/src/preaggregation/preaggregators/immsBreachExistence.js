/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';
import winston from 'winston';

import { utcMoment, PERIOD_TYPES, momentToPeriod } from '@tupaia/utils';
import {
  FRIDGE_BREACH_PROGRAM_CODE,
  FRIDGE_DAILY_PROGRAM_CODE,
  WORLD,
} from './vaccineFridgeConstants';

const { DAY } = PERIOD_TYPES;

const AGGREGATION_NAME = 'IMMS Breach Existence';

/**
 * Calculates whether a breach has occurred for each organisation unit
 * in `${OU_GROUP_CODE}` the last `${LOOKUP_PERIOD_IN_DAYS}` days
 */
const immsBreachExistenceWithinPeriod = async (
  aggregator,
  { orgUnitGroupCode, numberOfDays, dataElementCode },
) => {
  winston.info(`Starting to aggregate ${AGGREGATION_NAME}: ${dataElementCode}`);

  const periodFetchConfig = {
    organisationUnitCode: orgUnitGroupCode,
    startDate: utcMoment().subtract(numberOfDays, 'days').format(),
    endDate: utcMoment().format(),
    useDeprecatedApi: true,
  };

  const breachEvents = await aggregator.fetchEvents(FRIDGE_BREACH_PROGRAM_CODE, periodFetchConfig);

  const dailyFridgeDataEvents = await aggregator.fetchEvents(
    FRIDGE_DAILY_PROGRAM_CODE,
    periodFetchConfig,
  );

  const { results } = await aggregator.fetchAnalytics(dataElementCode, {
    ...periodFetchConfig,
    period: 'LAST_YEAR;THIS_YEAR',
  });

  // We want to delete all previous dataValues for this dataElement
  // so that each time the breaches are calculated, facilities
  // that haven't supplied fridge data within the lookback period are
  // set back to 'no data', rather than being left as their last calculated
  // value.
  await Promise.all(
    results.map(
      async result =>
        await aggregator.deleteAggregateDataValue({
          code: dataElementCode,
          period: result.period,
          orgUnit: result.organisationUnit,
        }),
    ),
  );

  const orgUnitsWithBreach = Object.keys(groupBy(breachEvents, 'orgUnit'));
  const orgUnitsWithFridgeData = Object.keys(groupBy(dailyFridgeDataEvents, 'orgUnit'));
  const period = momentToPeriod(utcMoment(), DAY);

  const dataValues = orgUnitsWithFridgeData.map(orgUnit => ({
    code: dataElementCode,
    period,
    orgUnit,
    value: orgUnitsWithBreach.includes(orgUnit) ? 1 : 0,
  }));

  winston.info(`${AGGREGATION_NAME} (${numberOfDays} days) done, pushing new data values...`);
  if (dataValues.length === 0) {
    winston.info('No new data to push');
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

const BREACH_LAST_30_DAYS = 'BREACH_LAST_30_DAYS';
const BREACH_LAST_48_HOURS = 'BREACH_LAST_48_HOURS';

export const immsBreachExistence = async aggregator => {
  await immsBreachExistenceWithinPeriod(aggregator, {
    orgUnitGroupCode: WORLD,
    numberOfDays: 30,
    dataElementCode: BREACH_LAST_30_DAYS,
  });

  await immsBreachExistenceWithinPeriod(aggregator, {
    orgUnitGroupCode: WORLD,
    numberOfDays: 2,
    dataElementCode: BREACH_LAST_48_HOURS,
  });
};
