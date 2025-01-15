import { DataPerOrgUnitBuilder } from './DataPerOrgUnitBuilder';
import { CountEventsBuilder } from '/apiV1/dataBuilders/generic/count/countEvents';
import { mapMeasureValuesToGroups } from './helpers';

export class GroupEventsPerOrgUnitBuilder extends DataPerOrgUnitBuilder {
  getBaseBuilderClass = () => CountEventsBuilder;

  async fetchResultsAndPeriod() {
    return { results: await this.fetchEvents({}), period: null };
  }

  formatData(data) {
    const { groups } = this.config;
    const { dataElementCode } = this.query;

    return data.map(dataElement => mapMeasureValuesToGroups(dataElement, dataElementCode, groups));
  }
}

export const groupEventsPerOrgUnit = async (
  models,
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig,
  entity,
) => {
  const builder = new GroupEventsPerOrgUnitBuilder(
    models,
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
    entity,
  );
  return builder.build();
};
