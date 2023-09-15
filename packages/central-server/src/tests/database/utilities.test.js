import { expect } from 'chai';
import sinon from 'sinon';

import { ModelRegistry } from '@tupaia/database';
import { getUniversalTypes } from '../../database/utilities/getUniversalTypes';
import { translateEntityConfig } from '../../database/utilities/translateEntityConfig';

const NEW_FORMAT_CONFIG_EXAMPLE = {
  config: {
    entity: {
      createNew: true,
      fields: {
        parentId: {
          questionId: 'TEST_QUESTION_ID'
        }
      }
    }
  }
} 

const OLD_FORMAT_CONFIG_EXAMPLE = {
  config: {
    entity: {
      createNew: true,
      parentId: {
        questionId: 'TEST_QUESTION_ID'
      }
    }
  }
}

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

  describe('translateEntityConfig', () => {
    it('should return an object with the old entity config format', () => {
      expect(translateEntityConfig(record)).to.;
    });
  });
});
