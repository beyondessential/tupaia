/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from './GETHandler';
import { checkAnyPermissions, hasBESAdminAccess, hasTupaiaAdminPanelAccess } from '../permissions';

const columns = {
  id: 'disaster.id',
  type: 'disaster.type::text',
  name: 'disaster.name',
  description: 'disaster.description',
  country: 'country.name',
};

/**
 * Handles endpoint:
 * - /disaster
 */
export class GETDisasters extends GETHandler {
  // fail permissions checking if they definitely don't have access to the user groups required to
  // view disasters
  async checkPermissionsGate() {
    await this.checkPermissions(
      checkAnyPermissions(
        [hasBESAdminAccess, hasTupaiaAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to view disasters',
      ),
    );
  }

  async findRecords(criteria) {
    let where = ' where ';
    let whereClause = '';
    const bindParams = [];

    Object.keys(criteria).forEach(key => {
      if (key === 'disaster.id') {
        whereClause += `${where} ${columns.id} = ?`;
        bindParams.push(criteria[key]);
      } else {
        // check there's no dodgy comparator being used as an sql injection attack
        if (criteria[key].comparator !== 'ilike') {
          throw new Error('Only ilike is supported as a comparator for finding disasters');
        }
        whereClause += `${where} ${columns[key]} ${criteria[key].comparator} ?`;
        bindParams.push(criteria[key].comparisonValue);
      }
      where = ' and ';
    });

    return this.database.executeSql(
      `SELECT
      "disaster".id, "disaster".type, description, "disaster"."name", "country".name as country,
      ST_AsGeoJSON("point") as point,
      ST_AsGeoJSON("bounds") as bounds
    FROM "disaster"
      LEFT JOIN "entity"
        ON "disaster"."id" = "entity"."code"
      left join "country"
        ON "countryCode" = "country".code
    ${whereClause}`,
      bindParams,
    );
  }
}
