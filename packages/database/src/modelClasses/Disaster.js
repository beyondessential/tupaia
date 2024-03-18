/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class DisasterRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DISASTER;
}

export class DisasterModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return DisasterRecord;
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
