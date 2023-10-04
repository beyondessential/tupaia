/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry } from '@tupaia/database';

export interface DatatrakWebServerModelRegistry extends ModelRegistry {
  readonly entity: any;
}
