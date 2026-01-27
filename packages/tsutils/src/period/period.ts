import { reduceToDictionary } from '@tupaia/utils';
import { get } from 'es-toolkit/compat';
import { utcMoment } from '../datetime';

type PeriodType = keyof typeof PERIOD_TYPES;

interface PeriodTypeConfig {
  format: string;
  length: number;
  granularityOrder: number;
  displayFormat: string;
  momentShorthand: string;
  momentUnit: string;
}

const DAY = 'DAY';
const WEEK = 'WEEK';
const MONTH = 'MONTH';
const YEAR = 'YEAR';
const QUARTER = 'QUARTER';

/**
 * Available period formats for aggregation server data
 */
export const PERIOD_TYPES = {
  DAY, // e.g. '20180104'
  WEEK, // e.g. '2018W01'
  MONTH, // e.g. '201801'
  QUARTER, // e.g. '2018Q1'
  YEAR, // e.g. '2018'
} as const;

const NON_NUMERIC_PERIOD_TYPES = [WEEK, QUARTER];

export const DEFAULT_PERIOD_TYPE = PERIOD_TYPES.DAY;

const PERIOD_TYPE_CONFIG: Record<PeriodType, PeriodTypeConfig> = {
  [DAY]: {
    format: 'YYYYMMDD',
    length: 8,
    granularityOrder: 1,
    displayFormat: 'Do MMM YYYY',
    momentShorthand: 'd',
    momentUnit: 'day',
  },
  [WEEK]: {
    format: 'GGGG[W]WW',
    length: 7,
    granularityOrder: 2,
    displayFormat: 'Do MMM YYYY',
    momentShorthand: 'w',
    momentUnit: 'isoWeek',
  },
  [MONTH]: {
    format: 'YYYYMM',
    length: 6,
    granularityOrder: 3,
    displayFormat: 'MMM YYYY',
    momentShorthand: 'M',
    momentUnit: 'month',
  },
  [QUARTER]: {
    format: 'YYYY[Q]Q',
    length: 6,
    granularityOrder: 4,
    displayFormat: '[Q]Q YYYY',
    momentShorthand: 'Q',
    momentUnit: 'quarter',
  },
  [YEAR]: {
    format: 'YYYY',
    length: 4,
    granularityOrder: 5,
    displayFormat: 'YYYY',
    momentShorthand: 'Y',
    momentUnit: 'year',
  },
};

const createFieldToNumericPeriodType = (fieldName: keyof PeriodTypeConfig) =>
  reduceToDictionary(
    Object.entries(PERIOD_TYPE_CONFIG)
      .filter(([periodType]) => !NON_NUMERIC_PERIOD_TYPES.includes(periodType))
      .map(([periodType, { [fieldName]: field }]) => ({
        [fieldName]: field,
        periodType,
      })),
    fieldName,
    'periodType',
  );

const LENGTH_TO_NUMERIC_PERIOD_TYPE = createFieldToNumericPeriodType('length');

const createAccessor =
  <T extends keyof PeriodTypeConfig>(field: T) =>
  (periodType: PeriodType): PeriodTypeConfig[T] =>
    get(PERIOD_TYPE_CONFIG, [periodType, field]);

export const periodTypeToFormat = createAccessor('format');
const periodTypeToLength = createAccessor('length');
export const periodTypeToMomentUnit = createAccessor('momentUnit');

export const periodToType = (period = '') => {
  if (typeof period !== 'string') {
    throw new Error(`periodToType expects period to be a string, got: ${period}`);
  }

  if (period.includes('Q') && checkNonNumericPeriod(period, PERIOD_TYPES.QUARTER))
    return PERIOD_TYPES.QUARTER;
  if (period.includes('W') && checkNonNumericPeriod(period, PERIOD_TYPES.WEEK))
    return PERIOD_TYPES.WEEK;
  if (Number.isNaN(Number(period))) return undefined;

  return LENGTH_TO_NUMERIC_PERIOD_TYPE[period.length];
};

const checkNonNumericPeriod = (period: string, potentialType: PeriodType) => {
  if (period.length !== periodTypeToLength(potentialType)) return false;

  const requiredFormat = periodTypeToFormat(potentialType);
  // Allow letters in square brackets to be non-numeric
  const formatToCheck = requiredFormat.replace(/\[.\]/g, '?');
  let isValidFormat = true;
  // Makes sure all characters except the non-numeric one are numeric
  formatToCheck.split('').forEach((char, index) => {
    if (char === '?') {
      // Allowed to be a non-numeric character
    } else if (Number.isNaN(Number(period[index]))) isValidFormat = false;
  });

  return isValidFormat;
};

/**
 * Parse period into a moment object
 */
export const periodToMoment = (period: string) => {
  const periodType = periodToType(period) as PeriodType;
  return utcMoment(period, periodTypeToFormat(periodType));
};
