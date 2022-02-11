/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { SqlQuery } from './SqlQuery';

export class EventsFetchQuery {
  constructor(database, options) {
    this.database = database;

    const {
      organisationUnitCodes,
      startDate,
      endDate,
      eventId,
      dataGroupCode,
      dataElementCodes,
    } = options;

    this.dataElementCodes = dataElementCodes;
    this.entityCodes = organisationUnitCodes;
    this.startDate = startDate;
    this.endDate = endDate;
    this.eventId = eventId;
    this.dataGroupCode = dataGroupCode;
    this.hasDataElements = dataElementCodes && dataElementCodes.length > 0;
  }

  async fetch() {
    const { query, params } = this.buildQueryAndParams();

    const sqlQuery = new SqlQuery(query, params);

    return sqlQuery.executeOnDatabase(this.database);
  }

  getAliasedColumns() {
    const aliasedColumns = [
      'date',
      'entity_code AS "entityCode"',
      'entity_name AS "entityName"',
      'event_id as "eventId"',
      'value',
      'type',
    ];
    if (this.hasDataElements) {
      aliasedColumns.push('data_element_code AS "dataElementCode"');
    }
    return aliasedColumns.join(', ');
  }

  getInnerJoinsAndParams() {
    // We use INNER JOINs here as it's more performant than a large WHERE IN clause (https://dba.stackexchange.com/questions/91247/optimizing-a-postgres-query-with-a-large-in)
    let params = this.entityCodes;
    const joins = [SqlQuery.innerJoin('analytics', 'entity_code', this.entityCodes)];
    if (this.hasDataElements) {
      params = params.concat(this.dataElementCodes);
      joins.push(SqlQuery.innerJoin('analytics', 'data_element_code', this.dataElementCodes));
    }
    return { joins: joins.join('\n'), params };
  }

  getWhereClauseAndParams() {
    const conditions = [];
    const params = [];

    if (this.startDate) {
      conditions.push('date >= ?');
      params.push(this.startDate);
    }
    if (this.endDate) {
      conditions.push('date <= ?');
      params.push(this.endDate);
    }
    if (this.dataGroupCode) {
      conditions.push('data_group_code = ?');
      params.push(this.dataGroupCode);
    }
    if (this.eventId) {
      conditions.push('event_id = ?');
      params.push(this.eventId);
    }

    if (conditions.length === 0) {
      return '';
    }

    return { clause: `WHERE ${conditions.join(' AND ')}`, params };
  }

  buildQueryAndParams() {
    const { joins, params: joinsParams } = this.getInnerJoinsAndParams();
    const { clause: whereClause, params: whereParams } = this.getWhereClauseAndParams();
    const query = `
      SELECT ${this.getAliasedColumns()}
      FROM analytics
      ${joins}
      ${whereClause}
      ORDER BY date;
     `;
    const params = joinsParams.concat(whereParams);
    return { query, params };
  }
}
