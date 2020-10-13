import { ModelRegistry } from '@tupaia/database';
import { getModels } from '../getModels';

jest.mock('@tupaia/database');

describe('getModels()', () => {
  it('should return a ModelRegistry instance', () => {
    const models = getModels();
    expect(models).toBeInstanceOf(ModelRegistry);
  });
});
