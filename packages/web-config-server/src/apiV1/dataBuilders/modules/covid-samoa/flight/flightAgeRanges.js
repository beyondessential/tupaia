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
export const getPassengersPerAgeRange = (flight) => {
  const ageRangeData = {};

  for (const ageRange of getAgeRanges()) {
    const numPassengersInThisAgeRange = flight.events
      .filter(event => event.dataValues[PASSENGER_AGE] >= ageRange.min && event.dataValues[PASSENGER_AGE] <= ageRange.max)
      .length;

    ageRangeData[ageRange.key] = {
      numPassengersInThisAgeRange,
      percentageOfTotalPassengers: numPassengersInThisAgeRange / getTotalNumPassengers(flight),
    };
  }

  return ageRangeData;
}

