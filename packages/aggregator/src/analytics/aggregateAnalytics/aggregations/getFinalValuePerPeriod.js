import { PERIOD_TYPES, periodToType } from '@tupaia/tsutils';
import { convertToPeriod } from '@tupaia/utils';
import { getPreferredPeriod, getContinuousPeriodsForAnalytics } from './utils';

/**
 * Cache of analytics per dataElement, organisationUnit and period
 * Used for effective aggregation of final values
 */
class FinalValueCache {
  constructor(analytics, aggregationPeriod, preferredPeriodType) {
    this.generateCache(analytics, aggregationPeriod, preferredPeriodType);
  }

  generateCache = (analytics, aggregationPeriod, preferredPeriodType) => {
    const periodTypes = [];
    const cache = {};

    analytics.forEach(responseElement => {
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

    // Convert all the periods to a uniform aggregation period type
    // eg: FINAL_EACH_MONTH will convert all periods to monthly periods
    this.convertCachePeriods(aggregationPeriod);
  };

  convertCachePeriods = periodType => {
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
   *  * keys: An object with { dataElement, organisationUnit, period } shape
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

  getFilledValues(aggregationPeriod, fillEmptyPeriodsWith) {
    const fillingPreviousValues = fillEmptyPeriodsWith === 'previous';

    const values = [];
    this.cache.iterateOrganisationUnitCache(organisationUnitCache => {
      const analyticsPerOrgUnit = Object.values(organisationUnitCache);
      const periods = getContinuousPeriodsForAnalytics(
        analyticsPerOrgUnit,
        aggregationPeriod,
        fillingPreviousValues, // To get a continuous period till now, we need to set true for this option config (continueTilCurrentPeriod). This can be a new option config in the future.
      );
      let mostRecentValue = fillingPreviousValues ? undefined : analyticsPerOrgUnit[0];

      periods.forEach(period => {
        const valueForPeriod = organisationUnitCache[period];

        if (valueForPeriod !== undefined) {
          mostRecentValue = valueForPeriod;
        }
        if (mostRecentValue !== undefined) {
          const valueForOneOrgUnit = {
            ...mostRecentValue,
            period,
          };
          if (!fillingPreviousValues && !valueForPeriod) {
            valueForOneOrgUnit.value = fillEmptyPeriodsWith;
          }
          values.push(valueForOneOrgUnit);
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

export const getFinalValuePerPeriod = (analytics, aggregationConfig, aggregationPeriod) => {
  const defaultOptions = {
    preferredPeriodType: PERIOD_TYPES.YEAR,
  };
  const options = { ...defaultOptions, ...aggregationConfig };
  const cache = new FinalValueCache(analytics, aggregationPeriod, options.preferredPeriodType);
  const valueAggregator = new FinalValueAggregator(cache);

  return options.hasOwnProperty('fillEmptyPeriodsWith')
    ? valueAggregator.getFilledValues(aggregationPeriod, options.fillEmptyPeriodsWith)
    : valueAggregator.getDistinctValues();
};
