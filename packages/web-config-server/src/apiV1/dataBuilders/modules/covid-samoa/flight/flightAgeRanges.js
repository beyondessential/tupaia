export const PASSENGER_AGE = 'QMIA008';


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
}


/**
 * @param {Flight} flight
 * @returns {number}
 */
export const getTotalNumPassengers = (flight) => {
  return flight.events.length; // each event is a passenger
}

/**
 * @param {Flight} flight
 * @returns {*}
 */
export const getPassengersPerDataValue = (flight, dataValues, comparator = dataValue => event => event.dataValues[dataValue] && event.dataValues[dataValue] === 'Yes') => {
  const dataValueCounts = {};
  for (const dataValue of dataValues) {
    const numPassengers = flight.events
      .filter(comparator(dataValue))
      .length;

      dataValueCounts[(dataValue.key || dataValue)] = {
      numPassengers,
      percentageOfTotalPassengers: numPassengers / getTotalNumPassengers(flight),
    };
  }

  return dataValueCounts;
}

/**
 * @param {Flight} flight
 * @returns {*}
 */
export const getPassengersPerAgeRange = (flight) => {
  const dataValues = getAgeRanges();
  const comparator = ageRange => event =>  event.dataValues[PASSENGER_AGE] >= ageRange.min && event.dataValues[PASSENGER_AGE] <= ageRange.max;
  return getPassengersPerDataValue(flight, dataValues, comparator);
}

