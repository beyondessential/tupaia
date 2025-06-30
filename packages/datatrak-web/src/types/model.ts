import { ModelRegistry, LocalSystemFactModel } from '@tupaia/database';

export interface DatatrakWebModelRegistry extends ModelRegistry {
  readonly localSystemFact: LocalSystemFactModel;
}
