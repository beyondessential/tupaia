import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import sinon from 'sinon';
import sinonTest from 'sinon-test';
import winston from 'winston';

import { pushChange } from '../../dhis/pushChange';
import { AggregateDataPusher, EventPusher } from '../../dhis/pushers';
import * as GetPusherForEntity from '../../dhis/pushers/entity/getPusherForEntity';
import { TestableApp } from '../testUtilities';

const test = sinonTest(sinon);

const app = new TestableApp();
const { models } = app;

const ANSWER = models.answer.databaseRecord;
const ENTITY = models.entity.databaseRecord;
const SURVEY_RESPONSE = models.surveyResponse.databaseRecord;

describe('pushChange()', () => {
  describe('Push Handler selection', () => {
    beforeEach(() => {
      sinon.stub(AggregateDataPusher.prototype, 'push');
      sinon.stub(EventPusher.prototype, 'push');
      sinon.stub(GetPusherForEntity, 'getPusherForEntity');
    });

    afterEach(() => {
      AggregateDataPusher.prototype.push.restore();
      EventPusher.prototype.push.restore();
      GetPusherForEntity.getPusherForEntity.restore();
    });

    it(
      'should use an event push handler for an event based survey response',
      test(async function () {
        this.stub(models.surveyResponse, 'checkIsEventBased').returns(true);

        await pushChange(models, { record_type: SURVEY_RESPONSE });
        expect(EventPusher.prototype.push).to.have.callCount(1);
      }),
    );

    it('should use an entity push handler for an entity', async () => {
      await pushChange(models, { record_type: ENTITY });
      expect(GetPusherForEntity.getPusherForEntity).to.have.callCount(1);
    });

    it(
      'should use a data value push handler for a non event based survey response',
      test(async function () {
        this.stub(models.surveyResponse, 'checkIsEventBased').returns(false);

        await pushChange(models, { record_type: SURVEY_RESPONSE });
        expect(AggregateDataPusher.prototype.push).to.have.callCount(1);
      }),
    );

    it('should use a data value push handler for an answer', async () => {
      await pushChange(models, { record_type: ANSWER });
      expect(AggregateDataPusher.prototype.push).to.have.callCount(1);
    });

    it(
      'should return false and log an error if the record type is invalid',
      test(async function () {
        this.stub(winston, 'error').callsFake(error => error);

        const result = await pushChange(models, { record_type: 'otherType' });
        expect(result).to.be.false;
        expect(winston.error).to.have.callCount(1);
      }),
    );
  });
});
