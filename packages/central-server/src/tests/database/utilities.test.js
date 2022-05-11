import { expect } from 'chai';
import sinon from 'sinon';

import { ModelRegistry } from '@tupaia/database';
import { getUniversalTypes } from '../../database/utilities/getUniversalTypes';

const modelsStub = sinon.createStubInstance(ModelRegistry, {
  getMinAppVersionByType: {
    answer: '0.0.1',
    entity: '1.7.98',
    geographical_area: '0.0.23',
  },
});

describe('database utilities', () => {
  describe('getUniversalTypes()', () => {
    it('should return types that are available since the first app version', () => {
      expect(getUniversalTypes(modelsStub)).to.deep.equal(['answer']);
    });
  });
});
