import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';

export interface TestModelRegistry extends Omit<ModelRegistry, '#private'> {
  readonly database: TupaiaDatabase;
}
