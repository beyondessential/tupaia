import { expect } from 'chai';
import { SurveyResponseModel } from '../../../database/models/SurveyResponse';

describe('SurveyResponse', () => {
  describe('checkIsEventBased', () => {
    const otherModels = {
      entity: {
        orgUnitEntityTypes: ['country', 'district', 'facility', 'sub_district', 'village'],
      },
    };

    const createModel = (executeSqlResults = []) => {
      const model = new SurveyResponseModel({
        fetchSchemaForTable: () => {},
        executeSql: () => executeSqlResults,
      });
      model.otherModels = otherModels;
      return model;
    };

    it('checkIsEventBased should return false if there are no results from the database query', async () => {
      const model = createModel([]);
      const result = await model.checkIsEventBased(1);
      expect(result).to.equal(false);
    });

    it('checkIsEventBased should return true if results[0].count === 1', async () => {
      const model = createModel([
        {
          count: 1,
        },
      ]);
      const result = await model.checkIsEventBased(1);
      expect(result).to.equal(true);
    });

    it('checkIsEventBased should return false if results[0].count === "1"', async () => {
      const model = createModel([
        {
          count: '1',
        },
      ]);
      const result = await model.checkIsEventBased(1);
      expect(result).to.equal(false);
    });

    it('checkIsEventBased should return false if results[0].count > 1', async () => {
      const model = createModel([
        {
          count: 2,
        },
      ]);
      const result = await model.checkIsEventBased(1);
      expect(result).to.equal(false);
    });

    it('checkIsEventBased should return false if results[0].count < 1', async () => {
      const model = createModel([
        {
          count: 0,
        },
      ]);
      const result = await model.checkIsEventBased(1);
      expect(result).to.equal(false);
    });
  });
});
