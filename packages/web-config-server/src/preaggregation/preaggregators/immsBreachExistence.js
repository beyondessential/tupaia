/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';
import winston from 'winston';

import { utcMoment } from '@tupaia/utils';
import { PERIOD_TYPES, momentToPeriod } from '@tupaia/dhis-api';
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
 *
 * @param {DhisApi} dhisApi
 */
const immsBreachExistenceWithinPeriod = async (
  dhisApi,
  { orgUnitGroupCode, numberOfDays, dataElementCode },
) => {
  winston.info(`Starting to aggregate ${AGGREGATION_NAME}: ${dataElementCode}`);

  const periodFetchConfig = {
    organisationUnitCode: orgUnitGroupCode,
    startDate: utcMoment()
      .subtract(numberOfDays, 'days')
      .format(),
    endDate: utcMoment().format(),
  };

  const breachEvents = await dhisApi.getEvents({
    programCode: FRIDGE_BREACH_PROGRAM_CODE,
    ...periodFetchConfig,
  });

  const dailyFridgeDataEvents = await dhisApi.getEvents({
    programCode: FRIDGE_DAILY_PROGRAM_CODE,
    ...periodFetchConfig,
  });

  const { results } = await dhisApi.getAnalytics({
    ...periodFetchConfig,
    dataElementCodes: [dataElementCode],
    outputIdScheme: 'code',
    startDate: null,
    endDate: null,
  });

  // We want to delete all previous dataValues for this dataElement
  // so that each time the breaches are calculated, facilities
  // that haven't supplied fridge data within the lookback period are
  // set back to 'no data', rather than being left as their last calculated
  // value.
  await Promise.all(
    results.map(
      async result =>
        await dhisApi.deleteDataValue({
          dataElement: dataElementCode,
          period: result.period,
          orgUnit: result.organisationUnit,
        }),
    ),
  );

  const orgUnitsWithBreach = Object.keys(groupBy(breachEvents, 'orgUnit'));
  const orgUnitsWithFridgeData = Object.keys(groupBy(dailyFridgeDataEvents, 'orgUnit'));
  const period = momentToPeriod(utcMoment(), DAY);

  const dataValues = orgUnitsWithFridgeData.map(orgUnit => ({
    dataElement: dataElementCode,
    period,
    orgUnit,
    value: orgUnitsWithBreach.includes(orgUnit) ? 1 : 0,
  }));

  winston.info(`${AGGREGATION_NAME} (${numberOfDays} days) done, pushing new data values...`);
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

const BREACH_LAST_30_DAYS = 'BREACH_LAST_30_DAYS';
const BREACH_LAST_48_HOURS = 'BREACH_LAST_48_HOURS';

export const immsBreachExistence = async dhisApi => {
  await immsBreachExistenceWithinPeriod(dhisApi, {
    orgUnitGroupCode: WORLD,
    numberOfDays: 30,
    dataElementCode: BREACH_LAST_30_DAYS,
  });

  await immsBreachExistenceWithinPeriod(dhisApi, {
    orgUnitGroupCode: WORLD,
    numberOfDays: 2,
    dataElementCode: BREACH_LAST_48_HOURS,
  });
};
