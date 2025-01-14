import { VALUE_TYPES } from '@tupaia/utils';
import { ValueAndPercentageByDataValueByFlightDate } from './valueAndPercentageByDataValueByFlightDate';
import {
  Flight,
  FLIGHT_DATE,
  PASSENGER_AGE,
  getPassengersPerAgeRange,
  getTotalNumPassengers,
  getAgeRanges,
} from './flight';

export class ValueAndPercentageByAgeByFlightDate extends ValueAndPercentageByDataValueByFlightDate {
  getDataElementCodes = () => [FLIGHT_DATE, PASSENGER_AGE];

  getRows = (flights, columns) => {
    const rows = getAgeRanges().map(ageRange => {
      const row = {
        dataElement: `${ageRange.min}-${ageRange.max} yrs`,
        valueType: VALUE_TYPES.NUMBER_AND_PERCENTAGE,
      };

      for (const column of columns) {
        const flight = Flight.getFlightByKey(flights, column.key);

        const passengersForThisAgeRange = getPassengersPerAgeRange(flight)[ageRange.key];

        row[column.key] = {
          value: passengersForThisAgeRange.numPassengers,
          metadata: {
            numerator: passengersForThisAgeRange.numPassengers,
            denominator: getTotalNumPassengers(flight),
          },
        };
      }

      return row;
    });

    rows.push(this.getTotalsRow(flights, columns));

    return rows;
  };
}

export const valueAndPercentageByAgeByFlightDate = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
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
};
