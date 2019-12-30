/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import { BaseModel } from './BaseModel';

export class Disaster extends BaseModel {
  static databaseType = 'disaster';

  static fields = ['id', 'type', 'description', 'name', 'countryCode'];

  static getDisasters() {
    return Disaster.database.executeSql(`
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
