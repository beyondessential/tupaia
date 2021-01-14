import moment from 'moment';


export const FLIGHT_DATE = 'QMIA028';
const TIMEZONE_SAMOA = 'Pacific/Apia';

export class Flight {
  /*
   * Key uniquely identifies the flight. It should be fight number e.g. NZ990 but the data is messy
   * so we can't use flight number. Flight date is not usable either. See comments in
   * https://github.com/beyondessential/tupaia-backlog/issues/1437#issuecomment-757563930
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
        .tz(TIMEZONE_SAMOA)
        .format('YYYY-MM-DD');

      if (!eventsByFlightDate[flightDate]) {
        eventsByFlightDate[flightDate] = [];
      }

      eventsByFlightDate[flightDate].push(event);
    }

    // 2. create flights
    const flights = [];

    const toProcess = Object.keys(eventsByFlightDate);
    toProcess.sort(); // make sure dates are chronological

    while(toProcess.length > 0) {
      const flightDate = toProcess.shift();

      const flight = new Flight();
      flight.key = flightDate;
      flight.date = flightDate;
      flight.events = eventsByFlightDate[flightDate];
      flights.push(flight);
    }

    return flights;
  }

}
