import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';

export interface DatatrakWebServerModelRegistry extends Omit<ModelRegistry, '#private'> {
  readonly database: TupaiaDatabase;
}
