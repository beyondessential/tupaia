import { removeAt } from '@tupaia/utils';
import { PSSS_ENTITY, PSSS_HIERARCHY } from '../constants';
import { TupaiaApiClient } from '@tupaia/api-client';
import { Entity } from '@tupaia/types';

/**
 * Wrapper around the EntityApi
 */
export class EntityConnection {
  private readonly entityApi: TupaiaApiClient['entity'];
  public constructor(entityApi: TupaiaApiClient['entity']) {
    this.entityApi = entityApi;
  }

  public async fetchCountries() {
    return this.entityApi.getDescendantsOfEntity(PSSS_HIERARCHY, PSSS_ENTITY, {
      fields: ['id', 'code', 'name', 'type'],
      filter: { type: 'country' },
    }) as Promise<Pick<Entity, 'id' | 'code' | 'name' | 'type'>[]>;
  }

  public async fetchCountryAndSites(countryCode: string) {
    const entities: Pick<Entity, 'id' | 'code' | 'name' | 'type'>[] =
      await this.entityApi.getDescendantsOfEntity(
        PSSS_HIERARCHY,
        countryCode,
        {
          fields: ['id', 'code', 'name', 'type'],
          filter: { type: 'facility' },
        },
        true,
      );

    const countryIndex = entities.findIndex(e => e.code === countryCode);
    if (countryIndex === -1) {
      throw new Error(`Requested country '${countryCode}' is missing in the descendant response`);
    }
    const country = entities[countryIndex];
    const sites = removeAt(entities, countryIndex);

    return { country, sites };
  }

  public async fetchSiteCodes(entityCode: string) {
    return this.entityApi.getDescendantsOfEntity(PSSS_HIERARCHY, entityCode, {
      field: 'code',
      filter: { type: 'facility' },
    }) as Promise<Entity['code'][]>;
  }

  public async fetchSiteCodeToDistrictName(entityCode: string) {
    return this.entityApi.getRelationshipsOfEntity(
      PSSS_HIERARCHY,
      entityCode,
      'descendant',
      {},
      { filter: { type: 'district' }, field: 'name' },
      { filter: { type: 'facility' }, field: 'code' },
    ) as Promise<Record<string, string>>;
  }
}
