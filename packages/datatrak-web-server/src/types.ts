/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry, EntityModel } from '@tupaia/database';

export interface DatatrakWebServerModelRegistry extends ModelRegistry {
  readonly entity: EntityModel;
}
