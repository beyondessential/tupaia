import moment from 'moment';


export const FLIGHT_DATE = 'QMIA028';

export class Flight {
  /*
   * Key uniquely identifies the flight. It should be fight number e.g. NZ990 but the data is messy
   * so we can't use flight number. Instead we use flight date, but that is also a bit messy, since it's a date-time of
   * survey response, and these can be entered after midnight for a flight the previous day.
   *
   * Currently the best we can do is to assume that flight dates for two consecutive days are the same flight. See
   * https://github.com/beyondessential/tupaia-backlog/issues/1437#issuecomment-744919371
   */
  key = null;

  date = null;

  events = [];

  /**
   * @param {Flight[]} flights
   * @param {string} key
   * @returns {Flight}
   */
  static getFlightByKey = (flights, key) => flights
    .find(f => f.key === key);

  /**
   * @param events
   * @returns {Flight[]}
   */
  static fromEvents = (events) => {
    const eventsByFlightDate = {};

    // See comment in Flight class on property key
    // 1. group by date
    for (const event of events) {
      if (!event.dataValues[FLIGHT_DATE]) {
        continue;
      }

      const flightDate = moment(event.dataValues[FLIGHT_DATE])
        .format('YYYY-MM-DD');

      if (!eventsByFlightDate[flightDate]) {
        eventsByFlightDate[flightDate] = [];
      }

      eventsByFlightDate[flightDate].push(event);
    }

    // 2. group adjacent dates into the same flight
    const flights = [];

    const toProcess = Object.keys(eventsByFlightDate);
    toProcess.sort(); // make sure dates are chronological

    while(toProcess.length > 0) {
      const flightDate = toProcess.shift();

      const dayAfter = moment(flightDate)
        .add(1, 'day')
        .format('YYYY-MM-DD');

      const flight = new Flight();

      if (eventsByFlightDate[dayAfter]) {
        // combine day after and today
        flight.key = flightDate;
        flight.date = flightDate;
        flight.events = [...eventsByFlightDate[flightDate], ...eventsByFlightDate[dayAfter]];

        // and we also need to skip tomorrow in the next iteration of this loop
        toProcess.shift();

      } else {
        // all events are for the same day, no adjacent days, no need to combine
        flight.key = flightDate;
        flight.date = flightDate;
        flight.events = eventsByFlightDate[flightDate];
      }

      flights.push(flight);
    }

    return flights;
  }

}