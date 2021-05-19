export const PASSENGER_AGE = 'QMIA008';
export const DEFAULT_COMPARE_VALUE = 1;

export const getAgeRanges = () => {
  const ageRanges = [];

  for (let i = 0; i < 100; i += 5) {
    const min = i;
    const max = i + 4;

    const key = `${min}_${max}`;

    ageRanges.push({
      key,
      min,
      max,
    });
  }

  return ageRanges;
};

/**
 * @param {Flight} flight
 * @returns {number}
 */
export const getTotalNumPassengers = flight => {
  return flight.events.length; // each event is a passenger
};

const defaultDataValueComparator = dataValue => event => {
  const dataValueKey = dataValue[0] || dataValue;
  const compareValue = dataValue[1] || DEFAULT_COMPARE_VALUE;
  return event.dataValues[dataValueKey] && event.dataValues[dataValueKey] === compareValue;
};

/**
 * @param {Flight} flight
 * @param {Array} dataValues
 * @param {Function} comparator
 * @param {Boolean} useDataKeySuffix
 * @returns {*}
 */
export const getPassengersPerDataValue = (
  flight,
  dataValues,
  useDataKeySuffix = true,
  comparator = defaultDataValueComparator,
) => {
  const dataValueCounts = {};
  for (const dataValue of dataValues) {
    const numPassengers = flight.events.filter(comparator(dataValue)).length;
    const dataVal = dataValue.key || dataValue[0] || dataValue;
    const dataKeySuffix = dataValue[1] || DEFAULT_COMPARE_VALUE;
    const dataKey = useDataKeySuffix ? `${dataVal}_${dataKeySuffix}` : dataVal;
    dataValueCounts[dataKey] = {
      numPassengers,
      percentageOfTotalPassengers: numPassengers / getTotalNumPassengers(flight),
    };
  }

  return dataValueCounts;
};

/**
 * @param {Flight} flight
 * @returns {*}
 */
export const getPassengersPerAgeRange = flight => {
  const dataValues = getAgeRanges();
  const comparator = ageRange => event =>
    event.dataValues[PASSENGER_AGE] >= ageRange.min &&
    event.dataValues[PASSENGER_AGE] <= ageRange.max;
  return getPassengersPerDataValue(flight, dataValues, false, comparator);
};
