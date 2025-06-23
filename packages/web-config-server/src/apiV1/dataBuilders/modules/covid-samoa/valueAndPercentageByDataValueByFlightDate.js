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

    const events = await this.fetchEvents({ dataElementCodes });

    const flights = Flight.fromEvents(events);

    const columns = this.getColumns(flights);

    const rows = this.getRows(flights, columns);

    return {
      columns,
      rows,
    };
  }

  getDataElementCodes = () => {
    const { cells } = this.config;
    return [FLIGHT_DATE, ...cells.map(c => c[0])];
  };

  getColumns = flights => {
    const columns = [];

    flights.sort((a, b) => (a.date < b.date ? -1 : 1));

    for (const flight of flights) {
      const formattedDate = moment(flight.date).format('MMM D');
      columns.push({
        key: flight.key,
        title: `Number (%): ${formattedDate} Flight`,
      });
    }

    return columns;
  };

  /**
   *
   * Returns a sorted set of unique values returned from events of a specified dataElement
   */
  getDataValueSet = (events, dataValueKey) =>
    Array.from(new Set(events.map(e => e.dataValues[dataValueKey]))).sort((a, b) =>
      a > b ? 1 : -1,
    );

  getRows = (flights, columns) => {
    const { rows: rowsConfig, cells } = this.config;
    const useDynamicRows = rowsConfig === '$allValues';
    const rowHeaders = useDynamicRows
      ? this.getDataValueSet(flights.flatMap(f => f.events), cells[0])
      : rowsConfig;
    const dataValues = useDynamicRows ? rowHeaders.map(rowheader => [cells[0], rowheader]) : cells;
    const rows = rowHeaders.map((rowHeader, rowIndex) => {
      const row = {
        dataElement: `${rowHeader}`,
        valueType: 'numberAndPercentage',
      };
      const cellIndex = useDynamicRows ? 0 : rowIndex;
      const dataKey = cells[cellIndex][0] || cells[cellIndex];
      const dataKeySuffix = useDynamicRows
        ? rowHeader
        : cells[cellIndex][1] || DEFAULT_COMPARE_VALUE;
      for (const column of columns) {
        const flight = Flight.getFlightByKey(flights, column.key);
        const passengersForThisDataKey = getPassengersPerDataValue(flight, dataValues)[
          `${dataKey}_${dataKeySuffix}`
        ];
        const passengerCount = passengersForThisDataKey && passengersForThisDataKey.numPassengers;
        row[column.key] = {
          value: passengerCount,
          metadata: {
            numerator: passengerCount,
            denominator: getTotalNumPassengers(flight),
          },
        };
      }

      return row;
    });

    rows.push(this.getTotalsRow(flights, columns));

    return rows;
  };

  getTotalsRow = (flights, columns) => {
    const totalsRow = {
      dataElement: 'Total',
    };
    for (const column of columns) {
      const flight = Flight.getFlightByKey(flights, column.key);
      totalsRow[column.key] = getTotalNumPassengers(flight);
    }
    return totalsRow;
  };
}

export const valueAndPercentageByDataValueByFlightDate = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
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
};
