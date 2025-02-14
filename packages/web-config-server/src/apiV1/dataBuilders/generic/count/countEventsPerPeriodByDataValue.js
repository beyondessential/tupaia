import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { DataPerPeriodBuilder } from 'apiV1/dataBuilders/DataPerPeriodBuilder';
import { groupEventsByPeriod } from '@tupaia/dhis-api';

/**
 * @abstract
 */
class DataByValueBuilder extends DataBuilder {
  async buildData(results, optionCodeToName) {
    const { dataElement, valuesOfInterest, isPercentage } = this.config;

    const returnData = {};
    let totalEvents = 0;

    const valuesOfInterestLabelByValue = {};
    if (valuesOfInterest) {
      for (const spec of valuesOfInterest) {
        valuesOfInterestLabelByValue[spec.value] = spec.label;
      }
    }

    results.forEach(({ dataValues }) => {
      const value = dataValues[dataElement];

      if (!value) {
        return;
      }

      if (valuesOfInterest && !valuesOfInterestLabelByValue[value]) {
        // not interested in this value, ignore it
        return;
      }

      let label = value;
      if (valuesOfInterest && valuesOfInterestLabelByValue[value]) {
        label = valuesOfInterestLabelByValue[value];
      } else if (optionCodeToName && optionCodeToName[value]) {
        label = optionCodeToName[value];
      }

      if (!returnData[label]) {
        returnData[label] = 0;
      }
      returnData[label] += 1;
      totalEvents++;
    });

    // Turn to percentage
    if (isPercentage) {
      Object.keys(returnData).forEach(key => {
        returnData[key] /= totalEvents;
      });
    }
    return [returnData];
  }
}

export class CountEventsPerPeriodByDataValueBuilder extends DataPerPeriodBuilder {
  async fetchResults() {
    const dataElementCodes = [this.config.dataElement];
    return this.fetchEvents({ dataElementCodes });
  }

  groupResultsByPeriod = groupEventsByPeriod;

  getBaseBuilderClass = () => DataByValueBuilder;
}

export const countEventsPerPeriodByDataValue = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new CountEventsPerPeriodByDataValueBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );
  return builder.build();
};
