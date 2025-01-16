import moment from 'moment';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { Flight, getTotalNumPassengers, FLIGHT_DATE } from './flight';

export class TotalNumOfPassengerByFlightDate extends DataBuilder {
  async build() {
    const dataElementCodes = [FLIGHT_DATE];
    const { startDate, endDate } = this.query; // Selected period is not for event's response time, but to filter data element 'FLIGHT_DATE'.
    this.query.startDate = undefined; // Set to undefined to fetch all result.
    this.query.endDate = undefined;
    const events = await this.fetchEvents({ dataElementCodes });
    const flights = Flight.fromEvents(events);
    const flightsWithinPeriod = Flight.filterFlightByPeriod(flights, startDate, endDate);

    return this.buildData(flightsWithinPeriod);
  }

  buildData = flights => {
    const data = [];

    flights.sort((a, b) => (a.date < b.date ? -1 : 1));

    for (const flight of flights) {
      const formattedDate = moment(flight.date).format('Do MMMM');
      const value = getTotalNumPassengers(flight);
      data.push({
        name: formattedDate,
        value,
      });
    }

    return { data };
  };
}

export const totalNumOfPassengerByFlightDate = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new TotalNumOfPassengerByFlightDate(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    dataBuilderConfig.aggregationType,
  );
  return builder.build();
};
