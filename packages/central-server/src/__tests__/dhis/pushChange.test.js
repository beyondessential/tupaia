/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';
import { pushChange } from '../../dhis/pushChange';

const mockAggregateDataPusher = {
  push: jest.fn(),
};
const mockEventPusher = {
  push: jest.fn(),
};
const mockEntityPusher = {
  push: jest.fn(),
};

jest.mock('../../dhis/pushers', () => ({
  AggregateDataPusher: () => mockAggregateDataPusher,
  EventPusher: () => mockEventPusher,
  getPusherForEntity: async () => () => mockEntityPusher,
}));

describe('pushChange()', () => {
  const models = {
    answer: {
      databaseType: TYPES.ANSWER,
    },
    entity: {
      databaseType: TYPES.ENTITY,
    },
    surveyResponse: {
      databaseType: TYPES.SURVEY_RESPONSE,
      checkIsEventBased: jest.fn(),
    },
  };

  describe('Push Handler selection', () => {
    it('should use an event push handler for an event based survey response', async () => {
      models.surveyResponse.checkIsEventBased.mockResolvedValue(true);

      await pushChange(models, { record_type: TYPES.SURVEY_RESPONSE });
      expect(mockEventPusher.push).toHaveBeenCalledTimes(1);
    });

    it('should use an entity push handler for an entity', async () => {
      await pushChange(models, { record_type: TYPES.ENTITY });
      expect(mockEntityPusher.push).toHaveBeenCalledTimes(1);
    });

    it('should use a data value push handler for a non event based survey response', async () => {
      models.surveyResponse.checkIsEventBased.mockResolvedValue(false);

      await pushChange(models, { record_type: TYPES.SURVEY_RESPONSE });
      expect(mockAggregateDataPusher.push).toHaveBeenCalledTimes(1);
    });

    it('should use a data value push handler for an answer', async () => {
      await pushChange(models, { record_type: TYPES.ANSWER });
      expect(mockAggregateDataPusher.push).toHaveBeenCalledTimes(1);
    });

    it('should return false if the record type is invalid', async () => {
      const result = await pushChange(models, { record_type: 'otherType' });
      expect(result).toBe(false);
    });
  });
});
