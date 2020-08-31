/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';
import winston from 'winston';
import { DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';

import { Pusher } from '../../../../dhis/pushers/Pusher';

import { TrackedEntityPusher } from '../../../../dhis/pushers/entity/TrackedEntityPusher';
import { createEntityStub, createModelsStub, createDhisApiStub } from './helpers';

const { TRACKED_ENTITY_INSTANCE } = DHIS2_RESOURCE_TYPES;

const DHIS_ID = 'dhisId';
const ENTITY_ID = 'entityId';
const ENTITY_NAME = 'entityName';
const ENTITY_CODE = 'entityCode';
const ENTITY_TYPE_ID = 'entityTypeId';
const ORGANISATION_UNIT_ID = 'orgUnitId';
const ORGANISATION_UNIT_CODE = 'orgUnitCode';
const NAME_ATTRIBUTE_ID = 'nameAttributeId';
const CODE_ATTRIBUTE_ID = 'codeAttributeId';

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

    afterEach(() => {
      Pusher.prototype.logResults.resetHistory();
    });

    describe('create/update an entity', () => {
      it('should log an error if the changed record was not found', async () => {
        const pusher = new TrackedEntityPusher(createModelsStub(), { type: 'update' }, {});
        await pusher.push();
        return expect(pusher.logResults).to.have.been.calledWithMatch(
          sinon.match({ errors: [sinon.match(/entity .*not found/i)] }),
        );
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

      it('should use name and code attributes when they are provided', async () => {
        const entity = createEntityStub(ENTITY_ID, {
          closestOrgUnit: getClosestOrgUnit(),
          type: 'type',
          name: ENTITY_NAME,
          code: ENTITY_CODE,
        });
        const models = createModelsStub({ entityRecords: [entity] });
        const dhisApiStub = createDhisApiStub({
          ...DEFAULT_DHIS_API_STUB_PROPS,
          entityAttributes: [
            { id: NAME_ATTRIBUTE_ID, code: 'NAME' },
            { id: CODE_ATTRIBUTE_ID, code: 'CODE' },
          ],
        });
        const pusher = new TrackedEntityPusher(models, getChange(), dhisApiStub);

        await pusher.push();
        expect(dhisApiStub.updateRecord).to.have.been.calledOnceWith(
          TRACKED_ENTITY_INSTANCE,
          sinon.match.has('attributes', [
            { attribute: NAME_ATTRIBUTE_ID, value: ENTITY_NAME },
            { attribute: CODE_ATTRIBUTE_ID, value: ENTITY_CODE },
          ]),
        );
      });

      it('should log an error if the entity has no type', async () => {
        const entity = createEntityStub(ENTITY_ID);
        const models = createModelsStub({ entityRecords: [entity] });
        const pusher = new TrackedEntityPusher(models, getChange(), {});
        await pusher.push();
        return expect(pusher.logResults).to.have.been.calledWithExactly({
          errors: ['Tracked entity type is required'],
        });
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
        await pusher.push();

        return expect(pusher.logResults).to.have.been.calledWithMatch(
          sinon.match({ errors: [sinon.match(/sync log .*not found/i)] }),
        );
      });
    });
  });
});
