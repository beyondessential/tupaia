/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import moment from 'moment';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import {
  Flight,
  FLIGHT_DATE,
  PASSENGER_AGE,
  getPassengersPerAgeRange,
  getTotalNumPassengers,
  getAgeRanges,
} from './flight';

class ValueAndPercentageByAgeByFlightDate extends DataBuilder {
  async build() {
    const dataElementCodes = [FLIGHT_DATE, PASSENGER_AGE];

    const events = await this.fetchEvents({ useDeprecatedApi: false, dataElementCodes });

    const flights = Flight.fromEvents(events);

    const columns = this.getColumns(flights);

    const rows = this.getRows(flights, columns);

    return {
      columns,
      rows,
    }
  }

  getColumns = (flights) => {
    const columns = [];

    flights.sort((a, b) => a.date < b.date ? -1 : 1);

    for (const flight of flights) {
      const formattedDate = moment(flight.date).format('MMM D') + ' Flight';
      columns.push({
        key: flight.key,
        title: `Number (%): ${formattedDate}`,
      });
    }

    return columns;
  }

  getRows = (flights, columns) => {
    const rows = getAgeRanges()
      .map((ageRange) => {
        const row = {
          dataElement: `${ageRange.min}-${ageRange.max} yrs`,
          valueType: 'numberAndPercentage',
        };

        for (const column of columns) {
          const flight = Flight.getFlightByKey(flights, column.key);

          const passengersForThisAgeRange = getPassengersPerAgeRange(flight)[ageRange.key];

          row[column.key] = {
            value: passengersForThisAgeRange.numPassengersInThisAgeRange,
            metadata: {
              numerator: passengersForThisAgeRange.numPassengersInThisAgeRange,
              denominator: getTotalNumPassengers(flight),
            }
          };
        }

        return row;
      });

    const totalsRow = {
      dataElement: 'Total',
    };
    for (const column of columns) {
      const flight = Flight.getFlightByKey(flights, column.key);
      totalsRow[column.key] = getTotalNumPassengers(flight);
    }
    rows.push(totalsRow);

    return rows;
  }
}

export const valueAndPercentageByAgeByFlightDate = async ({ models, dataBuilderConfig, query, entity }, aggregator, dhisApi) => {
  const builder = new ValueAndPercentageByAgeByFlightDate(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    dataBuilderConfig.aggregationType,
  );
  return builder.build();
}

