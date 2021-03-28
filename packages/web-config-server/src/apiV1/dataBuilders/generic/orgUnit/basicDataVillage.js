import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

export class BasicDataVillageBuilder extends DataBuilder {
  async build() {
    const facility = await this.entity.getParent(await this.fetchEntityHierarchyId());
    const facilityName = facility ? facility.name : DataBuilder.NO_DATA_AVAILABLE;

    const data = [
      { name: 'Type', value: 'Village/Hamlet' },
      { name: 'Nearest Health Facility', value: facilityName },
    ];

    return { data };
  }
}

export const basicDataVillage = (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new BasicDataVillageBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );
  return builder.build();
};
