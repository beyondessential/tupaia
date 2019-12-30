/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { keyBy } from 'lodash';
import sinon from 'sinon';

import { DhisApi } from '../../../../dhis/api/DhisApi';
import { DHIS2_RESOURCE_TYPES } from '../../../../dhis/api/types';

const { ORGANISATION_UNIT, TRACKED_ENTITY_ATTRIBUTE, TRACKED_ENTITY_TYPE } = DHIS2_RESOURCE_TYPES;

/**
 * @typedef {Object} EntityStub
 * @property {string} id
 * @property {string} [code]
 * @property {string} [parent_id]
 * @property {string} [name]
 * @property {string} [type]
 * @property {Object<string, any>} [metadata]
 * @property {Function} getDhisId
 * @property {Function} hasDhisId
 * @property {Function} isOrganisationUnit
 * @property {Function} setDhisId
 */

/**
 * @typedef {Object} DhisSyncLogStub
 * @property {string} record_id
 * @property {string} data JSON string of the synced record
 */

/**
 * @param {string} id
 * @param {Object<string, any>} [config]
 * @returns {EntityStub}
 */
export const createEntityStub = (
  id,
  { code, metadata, name, closestOrgUnit, setDhisId, type } = {},
) => {
  const dhisId = metadata && metadata.dhis && metadata.dhis.id;

  return {
    id,
    code,
    metadata,
    name,
    type,
    fetchClosestOrganisationUnit: () => closestOrgUnit,
    getDhisId: () => dhisId,
    hasDhisId: () => !!dhisId,
    setDhisId: setDhisId || sinon.stub().returnsArg(0),
    getData: () => ({ id, code, metadata, name, type }),
  };
};

/**
 * @param {Object} [modelStubs]
 * @param {EntityStub[]} [modelStubs.entityRecords]
 * @param {DhisSyncLogStub[]} [modelStubs.dhisSyncLogRecords]
 * @returns {{ entity, dhisSyncLog }}
 */
export const createModelsStub = ({ entityRecords, dhisSyncLogRecords } = {}) => {
  const entitiesById = keyBy(entityRecords, 'id');
  const syncLogsByRecordId = keyBy(dhisSyncLogRecords, 'record_id');

  return {
    entity: {
      findById: id => entitiesById[id],
    },
    dhisSyncLog: {
      findOne: ({ record_id: recordId }) => syncLogsByRecordId[recordId],
    },
  };
};

/**
 * @param {Object} [expectedResponses]
 * @param {{ id, displayName }} [expectedResponses.entityType]
 * @param {Array<{ id, code }>} [expectedResponses.entityAttributes]
 * @param {{ id, code }} [expectedResponses.organisationUnit]
 * @param {any} [expectedResponses.deleteRecordById]
 * @param {any} [expectedResponses.updateRecord]
 * @returns {sinon.SinonStubbedInstance<DhisApi>}
 */
export const createDhisApiStub = ({
  organisationUnit,
  entityType,
  entityAttributes,
  deleteRecordById,
  updateRecord,
}) => {
  const getRecordStub = sinon.stub();
  stubOrganisationUnit(getRecordStub, organisationUnit);
  stubEntityAttributeResponse(getRecordStub, entityAttributes);

  const getRecordsStub = sinon.stub();
  stubEntityTypeResponse(getRecordsStub, entityType);

  return sinon.createStubInstance(DhisApi, {
    getRecord: getRecordStub,
    getRecords: getRecordsStub,
    deleteRecordById,
    updateRecord,
  });
};

const stubOrganisationUnit = (stubMethod, organisationUnit) => {
  let result = null;
  let args = sinon.match.has('type', ORGANISATION_UNIT);
  if (organisationUnit) {
    args = args.and(sinon.match.has('code', organisationUnit.code));
    result = organisationUnit;
  }

  stubMethod.withArgs(args).returns(result);
};

const stubEntityAttributeResponse = (stubMethod, entityAttributes = []) => {
  const typeMatcher = sinon.match.has('type', TRACKED_ENTITY_ATTRIBUTE);
  if (entityAttributes.length > 0) {
    entityAttributes.forEach(attribute => {
      const { code: attributeCode } = attribute;
      stubMethod
        .withArgs(typeMatcher.and(sinon.match.has('code', attributeCode)))
        .returns(attribute);
    });
  } else {
    stubMethod.withArgs(typeMatcher).returns(null);
  }
};

const stubEntityTypeResponse = (stubMethod, entityType) => {
  const results = [];
  let args = sinon.match.has('type', TRACKED_ENTITY_TYPE);
  if (entityType) {
    args = args.and(sinon.match.has('filter', { displayName: entityType.displayName }));
    results.push(entityType);
  }

  stubMethod.withArgs(args).returns(results);
};
