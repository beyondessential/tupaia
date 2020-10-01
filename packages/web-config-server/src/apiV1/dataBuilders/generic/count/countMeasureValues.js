import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { divideValues } from '/apiV1/dataBuilders/helpers';
import { getMeasureBuilder } from '/apiV1/measureBuilders/getMeasureBuilder';

class CountMeasureValuesBuilder extends DataBuilder {
  async build() {
    const {
      measureBuilder,
      convertToPercentage,
      measureBuilderConfig,
      valueKey = 'value',
    } = this.config;

    const { aggregator, dhisApi, query, entity } = this;

    const { data: measureData } = await getMeasureBuilder(measureBuilder)(
      aggregator,
      dhisApi,
      { ...query, dataElementCode: valueKey },
      measureBuilderConfig,
      entity,
    );

    const dataByValue = {};
    // Sum recorded for calculating percentage
    let sum = 0;
    const addToMap = value => {
      if (!dataByValue[value]) {
        dataByValue[value] = { value: 0, name: value };
      }
      dataByValue[value].value += 1;
      sum += 1;
    };

    measureData.forEach(({ [valueKey]: value }) => {
      if (value !== null) addToMap(value);
    });

    if (convertToPercentage) {
      Object.entries(dataByValue).forEach(([key, { value }]) => {
        dataByValue[key].value = divideValues(value, sum);
      });
    }

    return { data: Object.values(dataByValue) };
  }
}

export function countMeasureValues(
  { dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
  aggregationType,
) {
  const builder = new CountMeasureValuesBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregationType,
  );
  return builder.build();
}
