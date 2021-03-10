/* eslint-disable max-classes-per-file */
/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EntityModel as BaseEntityModel } from '@tupaia/database';

export interface EntityFields {
  readonly code: string;
  readonly country_code: string;
}

export interface EntityModel extends BaseEntityModel, EntityFields {
  isProject: () => boolean;
  getChildren: (projectCode: string) => Promise<EntityModel[]>;
  findOne: (
    filter: { [field in keyof EntityFields]?: EntityFields[field] | EntityFields[field][] },
  ) => Promise<EntityModel>;
}
