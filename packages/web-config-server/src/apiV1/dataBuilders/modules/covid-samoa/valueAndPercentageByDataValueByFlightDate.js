/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import moment from 'moment';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import {
  Flight,
  getTotalNumPassengers,
  getPassengersPerDataValue,
  FLIGHT_DATE,
  DEFAULT_COMPARE_VALUE,
} from './flight';

export class ValueAndPercentageByDataValueByFlightDate extends DataBuilder {
  async build() {  
    const dataElementCodes = this.getDataElementCodes();

    const events = await this.fetchEvents({ useDeprecatedApi: false, dataElementCodes });

    const flights = Flight.fromEvents(events);

    const columns = this.getColumns(flights);

    const rows = this.getRows(flights, columns);

    return {
      columns,
      rows,
    }
  }

  getDataElementCodes = () => {
    const { cells } = this.config;  
    return [FLIGHT_DATE, ...cells.map(c=>c[0])];
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
    const { rows: rowHeaders, cells } = this.config;
    const rows = rowHeaders
      .map((rowHeader, rowIndex) => {
        const row = {
          dataElement: `${rowHeader}`,
          valueType: 'numberAndPercentage',
        };
        const dataKey = cells[rowIndex][0] || cells[rowIndex];
        const dataKeySuffix = cells[rowIndex][1] || DEFAULT_COMPARE_VALUE;
        for (const column of columns) {
          const flight = Flight.getFlightByKey(flights, column.key);
          const passengersForThisDataKey = getPassengersPerDataValue(flight, cells)[`${dataKey}_${dataKeySuffix}`];
          
          row[column.key] = {
            value:  passengersForThisDataKey.numPassengers,
            metadata: {
              numerator: passengersForThisDataKey.numPassengers,
              denominator: getTotalNumPassengers(flight),
            }
          };
        }
        
        return row;
      });

    rows.push(this.getTotalsRow(flights, columns));

    return rows;
  }

  getTotalsRow = (flights, columns) => {
    const totalsRow = {
      dataElement: 'Total',
    };
    for (const column of columns) {
      const flight = Flight.getFlightByKey(flights, column.key);
      totalsRow[column.key] = getTotalNumPassengers(flight);
    }
    return totalsRow;
  }
}

export const valueAndPercentageByDataValueByFlightDate = async ({ models, dataBuilderConfig, query, entity }, aggregator, dhisApi) => {
  const builder = new ValueAndPercentageByDataValueByFlightDate(
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

