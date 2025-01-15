export class DataSourceEntityProvider {
  constructor(entityApi) {
    this.entityApi = entityApi;
  }

  parseEntityType(entityType) {
    return entityType === 'requested' ? undefined : entityType;
  }

  async getDataSourceEntities(
    hierarchyName,
    entityCodes,
    dataSourceEntityType,
    dataSourceEntityFilter,
  ) {
    return this.entityApi.getRelativesOfEntities(hierarchyName, entityCodes, {
      field: 'code',
      filter: {
        type: this.parseEntityType(dataSourceEntityType),
        ...dataSourceEntityFilter,
      },
    });
  }

  async getDataSourceEntitiesAndRelationships(
    hierarchyName,
    entityCodes,
    aggregationEntityType,
    dataSourceEntityType,
    dataSourceEntityFilter,
  ) {
    const response = await this.entityApi.getRelationshipsOfEntities(
      hierarchyName,
      entityCodes,
      'descendant',
      { field: 'code' },
      { filter: { type: this.parseEntityType(aggregationEntityType) } },
      { filter: { type: this.parseEntityType(dataSourceEntityType), ...dataSourceEntityFilter } },
    );

    const formattedRelationships = {};
    Object.entries(response).forEach(([descendant, ancestor]) => {
      formattedRelationships[descendant] = { code: ancestor };
    });
    return [Object.keys(formattedRelationships), formattedRelationships];
  }
}
