import { expect } from 'chai';

import { ModelRegistry } from '@tupaia/database';
import { modelClasses } from '../modelClasses';
import { getModels } from '../getModels';

describe('getModels()', () => {
  it('should return a ModelRegistry which contains the required models', () => {
    const models = getModels();
    expect(models).to.be.instanceOf(ModelRegistry);
    expect(models.dataSource).to.be.instanceOf(modelClasses.DataSource);
  });
});
