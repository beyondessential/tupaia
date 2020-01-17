/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import winston from 'winston';
import * as DataBroker from '@tupaia/data-broker';

import { EventPusher } from '../../../../../dhis/pushers/data/event/EventPusher';
import { EventBuilder } from '../../../../../dhis/pushers/data/event/EventBuilder';
import { populateTestData, insertSurveyAndScreens, resetTestData } from '../../../../testUtilities';
import { Pusher } from '../../../../../dhis/pushers/Pusher';
import { getModels } from '../../../../getModels';
import { createDhisApiStub, resetDhisApiStubHistory } from './createDhisApiStub';
import { BASELINE_TEST_DATA, QUESTION, SURVEY, CHANGE, DHIS_REFERENCE } from './testData';

chai.use(chaiAsPromised);
chai.use(sinonChai);

// relatively simple tests in here as EventBuilder contains a lot of logic, and is tested separately
describe('EventPusher', () => {
  const models = getModels();
  const dhisApi = createDhisApiStub();

  describe('push()', () => {
    before(async () => {
      // Suppress logging while running the tests
      sinon.stub(winston, 'error');
      sinon.stub(winston, 'warn');
      sinon.stub(Pusher.prototype, 'logResults');
      sinon.stub(DataBroker, 'getDhisApiInstance').returns(dhisApi);
      sinon.stub(EventBuilder.prototype, 'build');
    });

    after(() => {
      winston.error.restore();
      winston.warn.restore();
      Pusher.prototype.logResults.restore();
      DataBroker.getDhisApiInstance.restore();
      EventBuilder.prototype.build.restore();
    });

    beforeEach(async () => {
      // populate default test data
      await insertSurveyAndScreens({ survey: SURVEY, screens: [[QUESTION]] });
      await populateTestData(BASELINE_TEST_DATA);
    });

    afterEach(async () => {
      // reset spy calls after each test case
      resetDhisApiStubHistory(dhisApi);

      // clear test data
      await resetTestData();
    });

    describe('creating a new survey response', () => {
      it('should throw an error if the changed record was not found', async () => {
        const change = await models.dhisSyncQueue.findById(CHANGE.id);
        change.record_id = 'does_not_exist_xxxxxxxxx';
        const pusher = new EventPusher(models, change, dhisApi);
        expect(pusher.push()).to.be.rejectedWith(
          `No survey response found for ${change.record_id}`,
        );
        expect(dhisApi.postEvents).not.to.have.been.called;
        expect(dhisApi.deleteEvent).not.to.have.been.called;
      });

      it('should post all the data values to a program', async () => {
        const change = await models.dhisSyncQueue.findById(CHANGE.id);
        const pusher = new EventPusher(models, change, dhisApi);

        const result = await pusher.push();
        expect(result).to.be.true;
        expect(dhisApi.postEvents).to.have.been.calledOnce;
        expect(dhisApi.deleteEvent).not.to.have.been.called;
      });
    });

    describe('updating an existing survey response', () => {
      it('should delete and repost all the data values to a program', async () => {
        const change = await models.dhisSyncQueue.findById(CHANGE.id);
        const syncLogRecord = {
          id: change.record_id,
          record_id: change.record_id,
          imported: 1,
          updated: 0,
          deleted: 0,
          ignored: 0,
          dhis_reference: DHIS_REFERENCE,
          data: '{}',
        };
        await populateTestData({ dhisSyncLog: [syncLogRecord] });

        const pusher = new EventPusher(models, change, dhisApi);

        const result = await pusher.push();
        expect(result).to.be.true;
        expect(dhisApi.deleteEvent).to.have.been.calledOnceWith(DHIS_REFERENCE);
        expect(dhisApi.postEvents).to.have.been.calledOnce;
      });
    });

    describe('deleting a survey response', () => {
      it('should delete the event entirely', async () => {
        const change = await models.dhisSyncQueue.findById(CHANGE.id);
        change.type = 'delete';
        const syncLogRecord = {
          id: change.record_id,
          record_id: change.record_id,
          imported: 1,
          updated: 0,
          deleted: 0,
          ignored: 0,
          dhis_reference: DHIS_REFERENCE,
          data: '{}',
        };
        await populateTestData({ dhisSyncLog: [syncLogRecord] });

        const pusher = new EventPusher(models, change, dhisApi);

        const result = await pusher.push();
        expect(result).to.be.true;
        expect(dhisApi.deleteEvent).to.have.been.calledOnceWith(DHIS_REFERENCE);
        expect(dhisApi.postEvents).not.to.have.been.called;
      });
    });
  });
});
