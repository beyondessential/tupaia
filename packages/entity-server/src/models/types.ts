/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel, DatabaseType } from '@tupaia/database';

export type Model<BaseModel extends DatabaseModel, Fields, Type extends DatabaseType> = {
  findOne: (filter: { [field in keyof Fields]?: Fields[field] | Fields[field][] }) => Promise<Type>;
} & BaseModel;
