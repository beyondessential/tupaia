/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '..';

export class MeditrakClient extends DatabaseType {
  static databaseType = TYPES.MEDITRAK_CLIENT;
}

export class MeditrakClientModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return MeditrakClient;
  }
}
