import { SqlQuery } from '@tupaia/database';
import { DataLakeDatabase } from './DataLakeDatabase';

export type AnalyticsFetchOptions = {
  dataElementCodes: string[];
  organisationUnitCodes: string[];
  startDate?: string;
  endDate?: string;
};

export type AnalyticsFetchResult = {
  analytics: Analytic[];
  numAggregationsProcessed: number;
};

export type Analytic = {
  period: string;
  entityCode: string;
  type: string;
  value: any;
  dataElementCode: string;
};

export class DataLakeAnalyticsFetchQuery {
  private readonly database: DataLakeDatabase;
  private readonly dataElementCodes: string[];
  private readonly entityCodes: string[];
  private readonly startDate?: string;
  private readonly endDate?: string;

  public constructor(database: DataLakeDatabase, options: AnalyticsFetchOptions) {
    this.database = database;

    const { dataElementCodes, organisationUnitCodes, startDate, endDate } = options;
    this.dataElementCodes = dataElementCodes;
    this.entityCodes = organisationUnitCodes;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  public async fetch() {
    const { query, params } = this.buildQueryAndParams();

    const sqlQuery = new SqlQuery<Analytic[]>(query, params);

    return {
      analytics: await sqlQuery.executeOnDatabase(this.database),
      numAggregationsProcessed: 0,
    };
  }

  private getPeriodConditionsAndParams() {
    const periodConditions = [];
    const periodParams = [];
    if (this.startDate) {
      periodConditions.push('date >= ?');
      periodParams.push(this.startDate);
    }
    if (this.endDate) {
      periodConditions.push('date <= ?');
      periodParams.push(this.endDate);
    }
    return { periodConditions, periodParams };
  }

  private getBaseWhereClauseAndParams() {
    const { periodConditions, periodParams } = this.getPeriodConditionsAndParams();

    if (periodConditions.length === 0) {
      return { clause: '', params: [] };
    }

    return { clause: `WHERE ${periodConditions.join(' AND ')}`, params: periodParams };
  }

  private buildQueryAndParams() {
    const { clause: whereClause, params: whereParams } = this.getBaseWhereClauseAndParams();

    // We use INNER JOINs here as it's more performant than a large WHERE IN clause (https://dba.stackexchange.com/questions/91247/optimizing-a-postgres-query-with-a-large-in)
    const query = `
      SELECT 
        entity_code AS "entityCode", 
        data_element_code AS "dataElementCode",
        to_char(date, 'YYYYMMDD') as period,
        value_type as type,
        value
      FROM analytics
        ${SqlQuery.innerJoin('analytics', 'entity_code', this.entityCodes)}
        ${SqlQuery.innerJoin('analytics', 'data_element_code', this.dataElementCodes)}
      ${whereClause}
      ORDER BY date;
     `;
    const params = this.entityCodes.concat(this.dataElementCodes).concat(whereParams);

    return { query, params };
  }
}
