/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class DisasterType extends DatabaseType {
  static databaseType = TYPES.DISASTER;
}

export class DisasterModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DisasterType;
  }

  async getAllDisasterDetails() {
    return this.database.executeSql(`
      SELECT
        *,
        "disaster".type,
        ST_AsGeoJSON("point") as point,
        ST_AsGeoJSON("bounds") as bounds
      FROM "disaster"
        LEFT JOIN "entity"
          ON "disaster"."id" = "entity"."code";
    `);
  }
}
