import { DhisApi as BaseDhisApi } from '@tupaia/dhis-api';
import { Dhis2Error } from '@tupaia/utils';

export class DhisApi extends BaseDhisApi {
  constructor(...args) {
    super(...args);
    this.fetchDataSourceEntities = null;
  }

  constructError(message, dhisUrl) {
    return new Dhis2Error({ message }, dhisUrl);
  }

  // only used by "getDataValuesInSets", can be removed if we stop using that
  injectFetchDataSourceEntities(fetchDataSourceEntities) {
    this.fetchDataSourceEntities = fetchDataSourceEntities;
  }

  async getDataValuesInSets(query, entity) {
    if (!this.fetchDataSourceEntities) {
      throw new Error('Cannot getDataValuesInSets until fetchDataSourceEntities is injected');
    }

    const dataSourceEntities = await this.fetchDataSourceEntities(entity.code, {
      dataSourceEntityType: entity.model.types.FACILITY,
    });
    const organisationUnitCodes = dataSourceEntities.map(e => e.code);

    return super.getDataValuesInSets({ ...query, organisationUnitCodes });
  }
}
