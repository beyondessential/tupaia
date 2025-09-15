import { capital as capitaliseFirstLetters } from 'case';
import { DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';

import { EntityPusher } from './EntityPusher';

const {
  ORGANISATION_UNIT,
  TRACKED_ENTITY_ATTRIBUTE,
  TRACKED_ENTITY_INSTANCE,
  TRACKED_ENTITY_TYPE,
} = DHIS2_RESOURCE_TYPES;

export class TrackedEntityPusher extends EntityPusher {
  /**
   * @returns {Promise<PushResults>}
   */
  async createOrUpdate() {
    const entity = await this.fetchEntity();
    const record = await this.buildRecord(entity);
    const diagnostics = await this.api.updateRecord(TRACKED_ENTITY_INSTANCE, record);

    if (!entity.hasDhisTrackedEntityId()) {
      const trackedEntityId = diagnostics.references[0];
      await entity.setDhisTrackedEntityId(trackedEntityId);
    }

    const data = await entity.getData();
    return { ...diagnostics, data };
  }

  /**
   * @returns {Promise<PushResults>}
   */
  async delete() {
    const entityData = await this.fetchDataFromSyncLog();
    const trackedEntityId = entityData.metadata?.dhis?.trackedEntityId;
    const diagnostics = await this.api.deleteRecordById(TRACKED_ENTITY_INSTANCE, trackedEntityId);

    return diagnostics;
  }

  async buildRecord(entity) {
    const typeId = await this.fetchTrackedEntityTypeId(entity);
    const attributes = await this.buildAttributes(entity);
    const { code: orgUnitCode } = await entity.fetchNearestOrgUnitAncestor();
    const { id: orgUnit } = await this.fetchOrganisationUnitByCode(orgUnitCode);

    const record = {
      trackedEntityType: typeId,
      orgUnit,
      attributes,
    };
    if (entity.hasDhisTrackedEntityId()) {
      record.id = entity.getDhisTrackedEntityId();
    }

    return record;
  }

  async fetchTrackedEntityTypeId(entity) {
    const { type } = entity;
    if (!type) {
      throw new Error('Tracked entity type is required');
    }

    const [trackedEntityType] = await this.api.getRecords({
      type: TRACKED_ENTITY_TYPE,
      filter: { displayName: this.entityToTypeName(entity) },
    });

    if (!trackedEntityType) {
      throw new Error(`Tracked entity type not found for ${type}`);
    }

    return trackedEntityType.id;
  }

  /**
   * Example:
   * `new_type` => `New Type`
   */
  entityToTypeName = entity => capitaliseFirstLetters(entity.type);

  async buildAttributes(entity) {
    const attributeFields = ['name', 'code'];
    const attributes = [];
    await Promise.all(
      attributeFields.map(async fieldName => {
        const attribute = await this.api.getRecord({
          type: TRACKED_ENTITY_ATTRIBUTE,
          code: fieldName.toUpperCase(), // name -> NAME
        });
        if (attribute) {
          attributes.push({ attribute: attribute.id, value: entity[fieldName] });
        }
      }),
    );

    return attributes;
  }

  async fetchOrganisationUnitByCode(code) {
    return this.api.getRecord({ type: ORGANISATION_UNIT, code });
  }
}
