import { SqlQuery } from '@tupaia/database';
import { DataLakeDatabase } from './DataLakeDatabase';

export type EventsFetchOptions = {
  organisationUnitCodes: string[];
  startDate?: string;
  endDate?: string;
  eventId?: string;
  dataGroupCode: string;
  dataElementCodes?: string[];
};

export type Event = {
  date: string;
  entityCode: string;
  entityName: '';
  eventId: string;
  type: string;
  value: any;
  dataElementCode?: string;
};

export class DataLakeEventsFetchQuery {
  private readonly database: DataLakeDatabase;
  private readonly entityCodes: string[];
  private readonly startDate?: string;
  private readonly endDate?: string;
  private readonly eventId?: string;
  private readonly dataGroupCode: string;
  private readonly dataElementCodes?: string[];
  private readonly hasDataElements: boolean;

  public constructor(database: DataLakeDatabase, options: EventsFetchOptions) {
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
    this.hasDataElements = dataElementCodes ? dataElementCodes.length > 0 : false;
  }

  public async fetch() {
    const { query, params } = this.buildQueryAndParams();

    const sqlQuery = new SqlQuery<Event[]>(query, params);

    return sqlQuery.executeOnDatabase(this.database);
  }

  private getAliasedColumns() {
    const aliasedColumns = [
      'date',
      'entity_code AS "entityCode"',
      `'' AS "entityName"`,
      'event_id as "eventId"',
      `'Number' as "type"`,
      'value',
    ];
    if (this.hasDataElements) {
      aliasedColumns.push('data_element_code AS "dataElementCode"');
    }
    return aliasedColumns.join(', ');
  }

  private getInnerJoinsAndParams() {
    // We use INNER JOINs here as it's more performant than a large WHERE IN clause (https://dba.stackexchange.com/questions/91247/optimizing-a-postgres-query-with-a-large-in)
    let params = this.entityCodes;
    const joins = [SqlQuery.innerJoin('analytics', 'entity_code', this.entityCodes)];
    if (this.hasDataElements) {
      params = params.concat(this.dataElementCodes as string[]);
      joins.push(
        SqlQuery.innerJoin('analytics', 'data_element_code', this.dataElementCodes as string[]),
      );
    }
    return { joins: joins.join('\n'), params };
  }

  private getWhereClauseAndParams() {
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
      return { clause: '', params: [] };
    }

    return { clause: `WHERE ${conditions.join(' AND ')}`, params };
  }

  private buildQueryAndParams() {
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
