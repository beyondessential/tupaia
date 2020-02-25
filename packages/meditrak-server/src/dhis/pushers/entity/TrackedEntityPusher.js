/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { capital as capitaliseFirstLetters } from 'case';
import { DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';

import { getDhisIdFromEntityData } from '../../../database/models/Entity';
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

    if (!entity.hasDhisId()) {
      const dhisId = diagnostics.references[0];
      await entity.setDhisId(dhisId);
    }

    const data = await entity.getData();
    return { ...diagnostics, data };
  }

  /**
   * @returns {Promise<PushResults>}
   */
  async delete() {
    const entityData = await this.fetchDataFromSyncLog();
    const dhisId = getDhisIdFromEntityData(entityData);
    const diagnostics = await this.api.deleteRecordById(TRACKED_ENTITY_INSTANCE, dhisId);

    return diagnostics;
  }

  async buildRecord(entity) {
    const typeId = await this.fetchTrackedEntityTypeId(entity);
    const attributes = await this.buildAttributes(entity);
    const { code: orgUnitCode } = await entity.fetchClosestOrganisationUnit();
    const { id: orgUnit } = await this.fetchOrganisationUnitByCode(orgUnitCode);

    const record = {
      trackedEntityType: typeId,
      orgUnit,
      attributes,
    };
    if (entity.hasDhisId()) {
      record.id = entity.getDhisId();
    }

    return record;
  }

  async fetchTrackedEntityTypeId(entity) {
    const type = entity.type;
    if (!type) {
      throw new Error('Tracked entity type is required');
    }

    const [trackedEntityType] = await this.api.getRecords({
      type: TRACKED_ENTITY_TYPE,
      filter: { displayName: this.entityToTypeName(entity) },
    });

    return trackedEntityType.id;
  }

  /**
   * Example:
   * `new_type` => `New Type`
   */
  entityToTypeName = entity => capitaliseFirstLetters(entity.type);

  /**
   * Example:
   * `new_type` => `NEW_TYPE_NAME`
   */
  entityToNameAttributeCode = entity => `${entity.type.toUpperCase()}_NAME`;

  async buildAttributes(entity) {
    const attributes = [];

    const nameAttribute = await this.api.getRecord({
      type: TRACKED_ENTITY_ATTRIBUTE,
      code: this.entityToNameAttributeCode(entity),
    });
    if (nameAttribute) {
      attributes.push({ attribute: nameAttribute.id, value: entity.name });
    }

    return attributes;
  }

  async fetchOrganisationUnitByCode(code) {
    return this.api.getRecord({ type: ORGANISATION_UNIT, code });
  }
}
