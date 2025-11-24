import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import sinon from 'sinon';

import { ModelRegistry } from '@tupaia/database';
import { getUniversalTypes } from '../../database/utilities/getUniversalTypes';
import { translateEntityConfig } from '../../database/utilities/translateEntityConfig';

const NEW_FORMAT_CONFIG_EXAMPLE_1 = {
  config: JSON.stringify({
    entity: {
      createNew: true,
      fields: {
        parentId: {
          questionId: 'TEST_QUESTION_ID',
        },
      },
    },
  }),
};

const OLD_FORMAT_CONFIG_EXAMPLE_1 = {
  config: JSON.stringify({
    entity: {
      createNew: true,
      parentId: {
        questionId: 'TEST_QUESTION_ID',
      },
    },
  }),
};

const NEW_FORMAT_CONFIG_EXAMPLE_2 = {
  config: JSON.stringify({
    entity: undefined,
  }),
};

const OLD_FORMAT_CONFIG_EXAMPLE_2 = {
  config: JSON.stringify({
    entity: undefined,
  }),
};

const NEW_FORMAT_CONFIG_EXAMPLE_3 = {
  config: JSON.stringify({
    entity: {
      createNew: false,
      filter: {
        type: ['facility'],
      },
      fields: {
        parentId: {
          questionId: 'TEST_QUESTION_ID',
        },
      },
    },
  }),
};

const OLD_FORMAT_CONFIG_EXAMPLE_3 = {
  config: JSON.stringify({
    entity: {
      createNew: false,
      type: ['facility'],
    },
  }),
};

const NEW_FORMAT_CONFIG_EXAMPLE_4 = {
  config: JSON.stringify({
    entity: {
      createNew: true,
      fields: {
        parentId: {
          questionId: 'TEST_QUESTION_ID',
        },
        type: 'case',
      },
    },
  }),
};

const OLD_FORMAT_CONFIG_EXAMPLE_4 = {
  config: JSON.stringify({
    entity: {
      createNew: true,
      parentId: {
        questionId: 'TEST_QUESTION_ID',
      },
      type: ['case'],
    },
  }),
};

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
      expect(translateEntityConfig(NEW_FORMAT_CONFIG_EXAMPLE_1)).to.deep.equal(
        OLD_FORMAT_CONFIG_EXAMPLE_1,
      );
    });

    it('should not alter the structure if entity property is undefined', () => {
      expect(translateEntityConfig(NEW_FORMAT_CONFIG_EXAMPLE_2)).to.deep.equal(
        OLD_FORMAT_CONFIG_EXAMPLE_2,
      );
    });

    it('should return only filter if it not createNew but there are fields properties (and will render this question disfunctional for older app versions)', () => {
      expect(translateEntityConfig(NEW_FORMAT_CONFIG_EXAMPLE_3)).to.deep.equal(
        OLD_FORMAT_CONFIG_EXAMPLE_3,
      );
    });

    it('should ensure type property is an array', () => {
      expect(translateEntityConfig(NEW_FORMAT_CONFIG_EXAMPLE_4)).to.deep.equal(
        OLD_FORMAT_CONFIG_EXAMPLE_4,
      );
    });
  });
});
