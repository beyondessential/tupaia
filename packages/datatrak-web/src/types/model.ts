import { LocalSystemFactModel, ModelRegistry } from '@tupaia/database';

export interface DatatrakWebModelRegistry extends ModelRegistry {
  readonly localSystemFact: LocalSystemFactModel;
}
