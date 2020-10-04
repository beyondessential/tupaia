import { ModelRegistry } from '@tupaia/database';
import { modelClasses } from '../modelClasses';
import { getModels } from '../getModels';

describe('getModels()', () => {
  it('should return a ModelRegistry which contains the required models', () => {
    const models = getModels();
    expect(models).toBeInstanceOf(ModelRegistry);
    expect(models.dataSource).toBeInstanceOf(modelClasses.DataSource);
  });
});
