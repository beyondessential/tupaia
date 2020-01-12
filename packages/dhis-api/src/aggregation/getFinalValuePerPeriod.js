/**
 * Tupaia Config Server
 * * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import {
  PERIOD_TYPES,
  convertToPeriod,
  findCoarsestPeriodType,
  getCurrentPeriod,
  getPeriodsInRange,
  periodToType,
} from '../periodTypes';
import { getPreferredPeriod } from './getPreferredPeriod';

/**
 * Cache of DHIS result values per dataElement, organisationUnit and period
 * Used for effective aggregation of final values
 */
class FinalValueCache {
  /**
   * @param {Object[]} results Results from DHIS query
   * @param {string} aggregationPeriod
   */
  constructor(results, aggregationPeriod, preferredPeriodType) {
    this.generateCache(results, aggregationPeriod, preferredPeriodType);
  }

  generateCache = (results, aggregationPeriod, preferredPeriodType) => {
    const periodTypes = [];
    const cache = {};

    results.forEach(responseElement => {
      const {
        dataElement: dataElementId,
        organisationUnit,
        period: elementPeriod,
      } = responseElement;

      if (!cache[dataElementId]) {
        cache[dataElementId] = {};
      }
      if (!cache[dataElementId][organisationUnit]) {
        cache[dataElementId][organisationUnit] = {};
      }

      const period = convertToPeriod(elementPeriod, aggregationPeriod);

      const currentValue = cache[dataElementId][organisationUnit][period];
      const preferredPeriod = getPreferredPeriod(
        responseElement.period,
        (currentValue && currentValue.period) || undefined,
        preferredPeriodType,
      );

      if (preferredPeriod !== responseElement.period) {
        // Existing value is preferred over the current one, skip
        return;
      }
      cache[dataElementId][organisationUnit][period] = responseElement;

      const currentPeriodType = periodToType(responseElement.period);
      if (!periodTypes.includes(currentPeriodType)) {
        periodTypes.push(currentPeriodType);
      }
    });

    this.cache = cache;
    if (periodTypes.length > 1) {
      // If multiple period types exist, make data consistent by converting
      // all periods to the coarsest type (e.g. for day and month mix, convert to month)
      this.ensurePeriodConsistency(findCoarsestPeriodType(periodTypes));
    }
  };

  ensurePeriodConsistency = periodType => {
    this.iterate((value, { dataElement, organisationUnit, period }) => {
      this.cache[dataElement][organisationUnit][period] = {
        ...value,
        period: convertToPeriod(value.period, periodType),
      };
    });
  };

  /**
   * Iterates over all values and keys of the cache
   *
   * @param {Function} callback A callback which receives the following arguments:
   *  * value: The currently iterated value
   *  * keys: An object with { dataElement: {string}, organisationUnit: {string}, period: {number} } shape
   *    which corresponds to the keys of the currently iterated value
   */
  iterate(callback) {
    Object.keys(this.cache).forEach(dataElement => {
      Object.keys(this.cache[dataElement]).forEach(organisationUnit => {
        Object.keys(this.cache[dataElement][organisationUnit]).forEach(period => {
          const value = this.cache[dataElement][organisationUnit][period];
          callback(value, { dataElement, organisationUnit, period });
        });
      });
    });
  }

  iterateOrganisationUnitCache(callback) {
    Object.values(this.cache).forEach(dataElementCache => {
      Object.values(dataElementCache).forEach(organisationUnitCache => {
        callback(organisationUnitCache);
      });
    });
  }
}

class FinalValueAggregator {
  /**
   * @param {FinalValueCache} cache
   */
  constructor(cache) {
    this.cache = cache;
  }

  getContinuousValues(startPeriod, endPeriod) {
    const periods = getPeriodsInRange(startPeriod, endPeriod);

    const values = [];
    this.cache.iterateOrganisationUnitCache(organisationUnitCache => {
      let mostRecentValue;

      periods.forEach(period => {
        const valueForPeriod = organisationUnitCache[period];

        if (valueForPeriod !== undefined) {
          mostRecentValue = valueForPeriod;
        }
        if (mostRecentValue !== undefined) {
          values.push({
            ...mostRecentValue,
            period,
          });
        }
      });
    });

    return values;
  }

  getDistinctValues() {
    const values = [];
    this.cache.iterate(value => values.push(value));

    return values;
  }
}

const defaultOptions = {
  fillEmptyValues: false,
  preferredPeriodType: PERIOD_TYPES.YEAR,
};

export const getFinalValuePerPeriod = (results, aggregationPeriod, inOptions) => {
  const options = { ...defaultOptions, ...inOptions };
  const cache = new FinalValueCache(results, aggregationPeriod, options.preferredPeriodType);
  const valueAggregator = new FinalValueAggregator(cache);

  if (options.fillEmptyValues) {
    const periodsInResults = results.map(result =>
      convertToPeriod(result.period, aggregationPeriod),
    );
    const endPeriod = getCurrentPeriod(aggregationPeriod);
    const startPeriod = periodsInResults.length
      ? Math.min(...periodsInResults).toString()
      : endPeriod;

    return valueAggregator.getContinuousValues(startPeriod, endPeriod);
  }

  return valueAggregator.getDistinctValues();
};
