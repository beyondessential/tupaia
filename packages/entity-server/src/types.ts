/* eslint-disable @typescript-eslint/no-empty-interface */
/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry } from '@tupaia/database';
import { EntityModel } from './entity';

export { EntityModel, EntityFields } from './entity';
export { FetchEntityRequest, FetchEntityResponse, EntityResponseObject } from './routes';

export interface EntityServerModelRegistry extends ModelRegistry {
  readonly entity: EntityModel;
}

export type Context<T> = {
  [field in keyof T]: T[field];
};
