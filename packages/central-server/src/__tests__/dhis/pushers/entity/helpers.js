/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';
import { createModelsStub as baseCreateModelsStub } from '@tupaia/database';
import { createJestMockInstance } from '@tupaia/utils';

const { ORGANISATION_UNIT, TRACKED_ENTITY_ATTRIBUTE, TRACKED_ENTITY_TYPE } = DHIS2_RESOURCE_TYPES;

export const createEntityStub = (
  id,
  { code, metadata, name, closestOrgUnit, setDhisTrackedEntityId, type } = {},
) => {
  const trackedEntityId = metadata && metadata.dhis && metadata.dhis.trackedEntityId;

  return {
    id,
    code,
    metadata,
    name,
    type,
    fetchNearestOrgUnitAncestor: () => closestOrgUnit,
    getDhisTrackedEntityId: () => trackedEntityId,
    hasDhisTrackedEntityId: () => !!trackedEntityId,
    setDhisTrackedEntityId:
      setDhisTrackedEntityId || jest.fn().mockImplementation((...args) => args[0]),
    getData: () => ({ id, code, metadata, name, type }),
  };
};

export const createModelsStub = ({ entityRecords, dhisSyncLogRecords } = {}) => {
  return baseCreateModelsStub({
    entity: {
      records: entityRecords || [],
    },
    dhisSyncLog: {
      records: dhisSyncLogRecords || [],
    },
  });
};

export const createDhisApiStub = ({
  organisationUnit,
  entityType,
  entityAttributes = [],
  deleteRecordByIdResponse,
  updateRecordResponse,
}) =>
  createJestMockInstance('@tupaia/dhis-api', 'DhisApi', {
    getRecord: jest.fn(async ({ type, code }) => {
      if (type === ORGANISATION_UNIT) {
        return code === organisationUnit.code ? organisationUnit : null;
      }
      if (type === TRACKED_ENTITY_ATTRIBUTE) {
        return entityAttributes.find(attr => attr.code === code) || null;
      }

      return null;
    }),
    getRecords: jest.fn(async ({ type, filter }) => {
      if (type === TRACKED_ENTITY_TYPE) {
        return filter?.displayName === entityType.displayName ? [entityType] : [];
      }

      return null;
    }),
    deleteRecordById: jest.fn().mockResolvedValue(deleteRecordByIdResponse),
    updateRecord: jest.fn().mockResolvedValue(updateRecordResponse),
  });
