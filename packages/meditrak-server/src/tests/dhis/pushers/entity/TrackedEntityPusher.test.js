/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import winston from 'winston';
import { DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';

import { Pusher } from '../../../../dhis/pushers/Pusher';

import { TrackedEntityPusher } from '../../../../dhis/pushers/entity/TrackedEntityPusher';
import { createEntityStub, createModelsStub, createDhisApiStub } from './helpers';

chai.use(chaiAsPromised);
chai.use(sinonChai);

const { TRACKED_ENTITY_INSTANCE } = DHIS2_RESOURCE_TYPES;

const DHIS_ID = 'dhisId';
const ENTITY_ID = 'entityId';
const ENTITY_NAME = 'entityName';
const ENTITY_TYPE_ID = 'entityTypeId';
const ORGANISATION_UNIT_ID = 'orgUnitId';
const ORGANISATION_UNIT_CODE = 'orgUnitCode';
const NAME_ATTRIBUTE_ID = 'nameAttributeId';

const DEFAULT_DHIS_API_STUB_PROPS = {
  entityType: { id: ENTITY_TYPE_ID, displayName: 'Type' },
  organisationUnit: { id: ORGANISATION_UNIT_ID, code: ORGANISATION_UNIT_CODE },
  updateRecord: {
    references: [DHIS_ID],
    wasSuccessful: true,
  },
  deleteRecordById: {
    wasSuccessful: true,
  },
};

// Default values to be used as a basis for the tests
const getClosestOrgUnit = () =>
  createEntityStub(ORGANISATION_UNIT_ID, { code: ORGANISATION_UNIT_CODE });
const getEntity = () =>
  createEntityStub(ENTITY_ID, { closestOrgUnit: getClosestOrgUnit(), type: 'type' });
const getExistingEntity = () =>
  createEntityStub(ENTITY_ID, {
    closestOrgUnit: getClosestOrgUnit(),
    type: 'type',
    metadata: {
      dhis: { id: DHIS_ID },
    },
  });
const getChange = () => ({ type: 'update', record_id: ENTITY_ID });
const getDhisApiStub = () => createDhisApiStub(DEFAULT_DHIS_API_STUB_PROPS);

describe('TrackedEntityPusher', () => {
  describe('push()', () => {
    before(() => {
      // Suppress logging while running the tests
      sinon.stub(winston, 'error');
      sinon.stub(winston, 'warn');
      sinon.stub(Pusher.prototype, 'logResults');
    });

    after(() => {
      winston.error.restore();
      winston.warn.restore();
      Pusher.prototype.logResults.restore();
    });

    describe('create/update an entity', () => {
      it('should throw an error if the changed record was not found', async () => {
        const pusher = new TrackedEntityPusher(createModelsStub(), { type: 'update' }, {});
        return expect(pusher.push()).to.be.rejectedWith(/entity .*not found/i);
      });

      it('should create a DHIS tracked entity when a DB entity is created', async () => {
        const entity = getEntity();
        const models = createModelsStub({ entityRecords: [entity] });
        const dhisApiStub = getDhisApiStub();
        const pusher = new TrackedEntityPusher(models, getChange(), dhisApiStub);

        const result = await pusher.push();
        expect(dhisApiStub.updateRecord).to.have.been.calledOnceWith(TRACKED_ENTITY_INSTANCE, {
          trackedEntityType: ENTITY_TYPE_ID,
          orgUnit: ORGANISATION_UNIT_ID,
          attributes: [],
        });
        expect(entity.setDhisId).to.always.have.been.calledWith(DHIS_ID);
        expect(result).to.equal(true);
      });

      it('should update a DHIS tracked entity when a DB entity is updated', async () => {
        const entity = getExistingEntity();
        const models = createModelsStub({ entityRecords: [entity] });
        const dhisApiStub = getDhisApiStub();
        const pusher = new TrackedEntityPusher(models, getChange(), dhisApiStub);

        const result = await pusher.push();
        expect(dhisApiStub.updateRecord).to.have.been.calledOnceWith(TRACKED_ENTITY_INSTANCE, {
          id: DHIS_ID,
          trackedEntityType: ENTITY_TYPE_ID,
          orgUnit: ORGANISATION_UNIT_ID,
          attributes: [],
        });
        expect(entity.setDhisId).to.have.callCount(0);
        expect(result).to.equal(true);
      });

      it('should use a name attribute when one is provided', async () => {
        const entity = createEntityStub(ENTITY_ID, {
          closestOrgUnit: getClosestOrgUnit(),
          type: 'type',
          name: ENTITY_NAME,
        });
        const models = createModelsStub({ entityRecords: [entity] });
        const dhisApiStub = createDhisApiStub({
          ...DEFAULT_DHIS_API_STUB_PROPS,
          entityAttributes: [{ id: NAME_ATTRIBUTE_ID, code: 'TYPE_NAME' }],
        });
        const pusher = new TrackedEntityPusher(models, getChange(), dhisApiStub);

        await pusher.push();
        expect(dhisApiStub.updateRecord).to.have.been.calledOnceWith(
          TRACKED_ENTITY_INSTANCE,
          sinon.match.has('attributes', [{ attribute: NAME_ATTRIBUTE_ID, value: ENTITY_NAME }]),
        );
      });

      it('should log an error if the entity has no type', async () => {
        const entity = createEntityStub(ENTITY_ID);
        const models = createModelsStub({ entityRecords: [entity] });
        const pusher = new TrackedEntityPusher(models, getChange(), {});

        return expect(pusher.push()).to.be.rejectedWith('entity type is required');
      });

      it('should handle entity types with more than one word', async () => {
        const entity = createEntityStub(ENTITY_ID, {
          closestOrgUnit: getClosestOrgUnit(),
          type: 'multiple_words_type',
          name: ENTITY_NAME,
        });
        const models = createModelsStub({ entityRecords: [entity] });
        const dhisApiStub = createDhisApiStub({
          ...DEFAULT_DHIS_API_STUB_PROPS,
          entityType: { id: ENTITY_TYPE_ID, displayName: 'Multiple Words Type' },
          entityAttributes: [{ id: NAME_ATTRIBUTE_ID, code: 'MULTIPLE_WORDS_TYPE_NAME' }],
        });
        const pusher = new TrackedEntityPusher(models, getChange(), dhisApiStub);

        await pusher.push();
        expect(dhisApiStub.updateRecord).to.have.been.calledOnceWith(
          TRACKED_ENTITY_INSTANCE,
          sinon.match.has('attributes', [{ attribute: NAME_ATTRIBUTE_ID, value: ENTITY_NAME }]),
        );
      });
    });

    describe('delete an entity', () => {
      const change = { type: 'delete', record_id: ENTITY_ID };

      it('should delete a DHIS tracked entity when a DB entity is deleted', async () => {
        const entity = getExistingEntity();
        const modelsStub = createModelsStub({
          dhisSyncLogRecords: [{ record_id: entity.id, data: JSON.stringify(entity) }],
        });
        const dhisApiStub = getDhisApiStub();
        const pusher = new TrackedEntityPusher(modelsStub, change, dhisApiStub);

        const result = await pusher.push();
        expect(dhisApiStub.deleteRecordById).to.have.been.calledOnceWith(
          TRACKED_ENTITY_INSTANCE,
          DHIS_ID,
        );
        expect(result).to.equal(true);
      });

      it('should throw an error if the deletable entity has not been synced', async () => {
        const modelsStub = createModelsStub({ dhisSyncLogRecords: [] });
        const pusher = new TrackedEntityPusher(modelsStub, change, getDhisApiStub());

        return expect(pusher.push()).to.be.rejectedWith(/sync log .*not found/i);
      });
    });
  });
});
