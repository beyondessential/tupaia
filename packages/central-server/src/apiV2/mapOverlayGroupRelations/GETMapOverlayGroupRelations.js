/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';
import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertMapOverlayGroupRelationsGetPermissions,
  createMapOverlayGroupRelationDBFilter,
  createRelationsViaParentMapOverlayDBFilter,
  createRelationsViaParentOverlayGroupDBFilter,
} from './assertMapOverlayGroupRelationsPermissions';
import { assertMapOverlayGroupsGetPermissions } from '../mapOverlayGroups';
import { assertMapOverlaysGetPermissions } from '../mapOverlays';
import { generateLinkHeader, processColumnSelectorKeys } from '../GETHandler/helpers';

/**
 * Handles endpoints:
 * - /mapOverlayGroupRelations
 * - /mapOverlayGroupRelations/:mapOverlayGroupRelationId
 * - /mapOverlayGroups/:parentRecordId/mapOverlayGroupRelations
 * - /mapOverlays/:parentRecordId/mapOverlayGroupRelations
 */
export class GETMapOverlayGroupRelations extends GETHandler {
  permissionsFilteredInternally = true;

  customJoinConditions = {
    map_overlay_group: ['map_overlay_group.id', 'map_overlay_group_relation.map_overlay_group_id'],
    map_overlay: ['map_overlay.id', 'map_overlay_group_relation.child_id'],
  };

  async findSingleRecord(mapOverlayGroupRelationId, options) {
    const mapOverlayGroupRelation = await super.findSingleRecord(
      mapOverlayGroupRelationId,
      options,
    );

    const mapOverlayChecker = accessPolicy =>
      assertMapOverlayGroupRelationsGetPermissions(
        accessPolicy,
        this.models,
        mapOverlayGroupRelationId,
      );

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, mapOverlayChecker]));

    return mapOverlayGroupRelation;
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createMapOverlayGroupRelationDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
    );
    return { dbConditions, dbOptions: options };
  }

  async getPermissionsViaParentFilter(criteria, options) {
    switch (this.parentRecordType) {
      case TYPES.MAP_OVERLAY_GROUP:
        return this.getPermissionsViaParentMapOverlayGroupFilter(criteria, options);
      case TYPES.MAP_OVERLAY:
        return this.getPermissionsViaParentMapOverlayFilter(criteria, options);
      default:
        throw new Error(`Cannot get map overlay relations for ${this.parentRecordType}`);
    }
  }

  async getPermissionsViaParentMapOverlayGroupFilter(criteria, options) {
    const mapOverlayGroupPermissionChecker = accessPolicy =>
      assertMapOverlayGroupsGetPermissions(accessPolicy, this.models, this.parentRecordId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, mapOverlayGroupPermissionChecker]),
    );

    const dbConditions = await createRelationsViaParentOverlayGroupDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
      this.parentRecordId,
    );

    return { dbConditions, dbOptions: options };
  }

  async getPermissionsViaParentMapOverlayFilter(criteria, options) {
    const parentPermissionChecker = accessPolicy =>
      assertMapOverlaysGetPermissions(accessPolicy, this.models, this.parentRecordId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, parentPermissionChecker]),
    );

    const dbConditions = await createRelationsViaParentMapOverlayDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
      this.parentRecordId,
    );

    return { dbConditions, dbOptions: options };
  }

  async buildResponse() {
    let options = await this.getDbQueryOptions();
    const requestIncludesChildCode = options.columns.find(column =>
      Object.keys(column).includes('childCode'),
    );

    // handle request for a single record
    const { recordId } = this;
    if (recordId) {
      const record = await this.findRecordWithChildCode(recordId, options);
      return { body: record };
    }

    // handle request for multiple records, including pagination headers
    let criteria = this.getDbQueryCriteria();

    if (this.permissionsFilteredInternally) {
      ({ dbConditions: criteria, dbOptions: options } = await this.applyPermissionsFilter(
        criteria,
        options,
      ));
    }

    const pageOfRecords = requestIncludesChildCode
      ? await this.findRecordsWithChildCode(criteria, options)
      : await this.findRecords(criteria, options);

    const totalNumberOfRecords = await this.countRecords(criteria, options);
    const { limit, page } = this.getPaginationParameters();
    const lastPage = Math.ceil(totalNumberOfRecords / limit);
    const linkHeader = generateLinkHeader(this.resource, page, lastPage, this.req.query);
    return {
      headers: {
        Link: linkHeader,
        'Access-Control-Expose-Headers': 'Link', // To get around CORS
      },
      body: pageOfRecords,
    };
  }

  getDbQueryCriteria() {
    const { filter: filterString } = this.req.query;
    const filter = filterString ? JSON.parse(filterString) : {};
    delete filter.childCode;
    return processColumnSelectorKeys(this.models, filter, this.recordType);
  }

  async findRecordsWithChildCode(criteria, options) {
    const optionsWithoutChildCodeOrId = { ...options };

    optionsWithoutChildCodeOrId.columns = optionsWithoutChildCodeOrId.columns.filter(
      column => !Object.keys(column).includes('childCode'),
    );

    const records = await this.findRecords(criteria, optionsWithoutChildCodeOrId);

    const recordsWithChildCode = await Promise.all(
      records.map(async record => {
        const updatedRecord = { ...record };
        const resource = record.child_type;
        const childRecord = await this.models[resource].findOne({ id: record.child_id });
        updatedRecord.childCode = childRecord.code;
        return updatedRecord;
      }),
    );

    return recordsWithChildCode;
  }

  async findRecordWithChildCode(recordId, options) {
    const optionsWithoutChildCodeOrId = { ...options };

    optionsWithoutChildCodeOrId.columns = optionsWithoutChildCodeOrId.columns.filter(
      column => !Object.keys(column).includes('childCode'),
    );

    const record = await this.findSingleRecord(recordId, optionsWithoutChildCodeOrId);
    const resource = record.child_type;
    const childRecord = await this.models[resource].findOne({ id: record.child_id });
    record.childCode = childRecord.code;

    return record;
  }
}
