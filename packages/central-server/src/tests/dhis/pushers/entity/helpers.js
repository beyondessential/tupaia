import sinon from 'sinon';

import { DhisApi, DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';
import { createModelsStub as baseCreateModelsStub } from '@tupaia/database';

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
    setDhisTrackedEntityId: setDhisTrackedEntityId || sinon.stub().returnsArg(0),
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
