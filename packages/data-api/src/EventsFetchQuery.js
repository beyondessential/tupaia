/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DataFetchQuery } from './DataFetchQuery';

export class EventsFetchQuery extends DataFetchQuery {
  constructor(database, options) {
    super(database, options);

    // immutable options specific to event fetching
    const { eventId, dataGroupCode, dataElementCodes } = options;
    this.eventId = eventId;
    this.dataGroupCode = dataGroupCode;
    this.hasDataElements = dataElementCodes && dataElementCodes.length > 0;
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

  getInnerJoins() {
    const joins = [this.createInnerJoin(this.entityCodes, 'entity_code')];
    if (this.hasDataElements) {
      joins.push(this.createInnerJoin(this.dataElementCodes, 'data_element_code'));
    }
    return joins.join('\n');
  }

  getWhereClause() {
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

    this.paramsArray.push(...params);
    return `WHERE ${conditions.join(' AND ')}`;
  }

  build() {
    this.query = `
      SELECT ${this.getAliasedColumns()}
      FROM analytics
      ${this.getInnerJoins()}
      ${this.getWhereClause()}
      ORDER BY date;
     `;
  }
}
