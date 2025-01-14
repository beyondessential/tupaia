import moment from 'moment';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

const buildResponse = rawData => {
  return rawData.map(x => ({
    ...x,
    name: moment(x.period).format('YYYY'),
  }));
};

class SimpleTableOfEventsBuilder extends DataBuilder {
  async build() {
    const events = await this.fetchAnalytics(this.config.dataElementCodes);
    const results = buildResponse(events.results);
    return { data: results };
  }
}

export const simpleTableOfEvents = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new SimpleTableOfEventsBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregator.aggregationTypes.FINAL_EACH_YEAR,
  );
  return builder.build();
};
