import { yup } from '@tupaia/utils';
import { TupaiaDatabase, SqlQuery } from '@tupaia/database';

const VALUE_AGGREGATION_FUNCTIONS = {
  SUM: 'sum(value::numeric)::text',
  MOST_RECENT: 'most_recent(value, date)',
};

const COMMONLY_SUPPORTED_CONFIG_KEYS = ['dataSourceEntityType', 'dataSourceEntityFilter'];

type AggregationSwitch = {
  groupByPeriodField?: string;
  aggregationFunction?: string;
  aggregateEntities?: boolean;
  supportedConfigKeys?: string[];
};
const AGGREGATION_SWITCHES: Record<string, AggregationSwitch> = {
  FINAL_EACH_DAY: {
    groupByPeriodField: 'day_period',
    aggregationFunction: VALUE_AGGREGATION_FUNCTIONS.MOST_RECENT,
  },
  FINAL_EACH_WEEK: {
    groupByPeriodField: 'week_period',
    aggregationFunction: VALUE_AGGREGATION_FUNCTIONS.MOST_RECENT,
  },
  SUM_EACH_WEEK: {
    groupByPeriodField: 'week_period',
    aggregationFunction: VALUE_AGGREGATION_FUNCTIONS.SUM,
  },
  FINAL_EACH_MONTH: {
    groupByPeriodField: 'month_period',
    aggregationFunction: VALUE_AGGREGATION_FUNCTIONS.MOST_RECENT,
  },
  FINAL_EACH_YEAR: {
    groupByPeriodField: 'year_period',
    aggregationFunction: VALUE_AGGREGATION_FUNCTIONS.MOST_RECENT,
  },
  MOST_RECENT: {
    aggregationFunction: VALUE_AGGREGATION_FUNCTIONS.MOST_RECENT,
  },
  MOST_RECENT_PER_ORG_GROUP: {
    aggregationFunction: VALUE_AGGREGATION_FUNCTIONS.MOST_RECENT,
    aggregateEntities: true,
    supportedConfigKeys: ['aggregationEntityType', 'orgUnitMap'],
  },
  SUM_PER_ORG_GROUP: {
    aggregationFunction: VALUE_AGGREGATION_FUNCTIONS.SUM,
    aggregateEntities: true,
    supportedConfigKeys: ['aggregationEntityType', 'orgUnitMap'],
  },
  SUM_PER_PERIOD_PER_ORG_GROUP: {
    aggregationFunction: VALUE_AGGREGATION_FUNCTIONS.SUM,
    aggregateEntities: true,
    groupByPeriodField: 'period',
    supportedConfigKeys: ['aggregationEntityType', 'orgUnitMap'],
  },
};

const supportsConfig = (
  aggregationSwitch: AggregationSwitch,
  config: Record<string, unknown> | undefined,
) => {
  if (!config) {
    return true;
  }

  const switchSupportedKeys = aggregationSwitch.supportedConfigKeys || [];
  return Object.keys(config).every(
    key => COMMONLY_SUPPORTED_CONFIG_KEYS.includes(key) || switchSupportedKeys.includes(key),
  );
};

const orgUnitMapValidator = yup.lazy((entityMap: unknown) => {
  const validatedMap = yup.object().required().validateSync(entityMap);
  const fieldValidator = yup.object().shape({ code: yup.string().required() });
  return yup.object().shape(
    Object.keys(validatedMap).reduce<Record<string, typeof fieldValidator>>(
      (mapValidator, key) => {
        mapValidator[key] = fieldValidator;
        return mapValidator;
      },
      {},
    ),
  );
});

export const buildEntityMap = (orgUnitMap: unknown = {}) => {
  const validatedMap = orgUnitMapValidator.validateSync(orgUnitMap);

  return Object.fromEntries(
    Object.entries(validatedMap).map(([key, value]) => {
      return [key, value.code];
    }),
  );
};

export type AnalyticsFetchOptions = {
  dataElementCodes: string[];
  organisationUnitCodes: string[];
  startDate?: string;
  endDate?: string;
  aggregations: (string | { type?: string; config?: Record<string, unknown> })[] | undefined;
};

export type Analytic = {
  period: string;
  entityCode: string;
  type: string;
  value: string;
  dataElementCode: string;
};

export type AnalyticsFetchResult = {
  analytics: Analytic[];
  numAggregationsProcessed: number;
};

type QueryAggregation = {
  config: { entityMap: Record<string, string> } & Record<string, unknown>;
  switch: AggregationSwitch;
  stackId: number;
};

export class AnalyticsFetchQuery {
  private readonly database: TupaiaDatabase;
  private readonly dataElementCodes: string[];
  private readonly entityCodes: string[];
  private readonly startDate?: string;
  private readonly endDate?: string;
  private readonly aggregations: QueryAggregation[];

  public constructor(database: TupaiaDatabase, options: AnalyticsFetchOptions) {
    this.database = database;

    const { dataElementCodes, organisationUnitCodes, startDate, endDate } = options;
    this.dataElementCodes = dataElementCodes;
    this.entityCodes = organisationUnitCodes;
    this.startDate = startDate;
    this.endDate = endDate;

    this.aggregations = [];
    if (options.aggregations) {
      for (let i = 0; i < options.aggregations.length; i++) {
        const aggregation = options.aggregations[i];
        if (typeof aggregation === 'string') {
          break;
        }

        const { type, config } = aggregation;

        const aggregationSwitch = type ? AGGREGATION_SWITCHES[type] : undefined;

        if (!type || !aggregationSwitch || !supportsConfig(aggregationSwitch, config)) {
          break; // We only support chaining aggregations up to the last supported type
        }

        const entityMap = buildEntityMap(config?.orgUnitMap);

        const queryAggregation = {
          switch: aggregationSwitch,
          config: { entityMap, ...config },
          stackId: i + 1,
        };

        this.aggregations.push(queryAggregation);
      }
    }

    this.validate();
  }

  public async fetch() {
    const { query, params } = this.buildQueryAndParams();

    const sqlQuery = new SqlQuery<Analytic[]>(query, params);

    return {
      analytics: await sqlQuery.executeOnDatabase(this.database),
      numAggregationsProcessed: this.aggregations.length,
    };
  }

  private validate() {
    this.aggregations.forEach(aggregation => {
      if (
        aggregation.switch.aggregateEntities &&
        Object.keys(aggregation.config.entityMap).length === 0
      ) {
        throw new Error('When using entity aggregation you must provide an org unit map');
      }
    });
  }

  private getEntityCodeField(aggregation: QueryAggregation) {
    return aggregation.switch.aggregateEntities ? 'aggregation_entity_code' : 'entity_code';
  }

  private getCtesAndParams(aggregation: QueryAggregation) {
    if (!aggregation.switch.aggregateEntities) {
      return { cte: '', params: [] };
    }

    // if mapping from one set of entities to another, include the mapped codes as "aggregation_entity_code"
    const columns = ['code', 'aggregation_entity_code'];
    const rows = Object.entries(aggregation.config.entityMap);
    const cte = `
      WITH entity_relations_a${aggregation.stackId} (${columns.join(', ')})
      AS (${SqlQuery.values(rows)})
    `;

    return { cte, params: rows.flat() };
  }

  private getAliasedColumns() {
    return [
      'entity_code AS "entityCode"',
      'data_element_code AS "dataElementCode"',
      'period',
      'value',
      'type',
    ].join(', ');
  }

  private getAggregationSelect(aggregation: QueryAggregation) {
    const { aggregationFunction, groupByPeriodField = 'period' } = aggregation.switch;

    const fields = [
      `${this.getEntityCodeField(aggregation)} as entity_code`,
      'data_element_code',
      `${aggregationFunction} as value`,
      'MAX(type) as type',
      'MAX(day_period) as day_period',
      'MAX(week_period) as week_period',
      'MAX(month_period) as month_period',
      'MAX(year_period) as year_period',
      'MAX(date) as date',
      `MAX(${groupByPeriodField}) as period`,
    ];

    return `SELECT ${fields.join(', ')}`;
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

  private getAggregationJoin(aggregation: QueryAggregation) {
    if (!aggregation.switch.aggregateEntities) {
      return '';
    }
    const previousTableName =
      aggregation.stackId === 1 ? 'base_analytics' : `a${aggregation.stackId - 1}`;
    const relationsTableName = `entity_relations_a${aggregation.stackId}`;
    return `INNER JOIN ${relationsTableName} on ${relationsTableName}.code = ${previousTableName}.entity_code`;
  }

  private getAggregationGroupByClause(aggregation: QueryAggregation) {
    const groupByFields = [this.getEntityCodeField(aggregation), 'data_element_code'];
    const { groupByPeriodField } = aggregation.switch;
    if (groupByPeriodField) groupByFields.push(groupByPeriodField);
    return `GROUP BY ${groupByFields.join(', ')}`;
  }

  private buildQueryAndParams() {
    const { ctes: ctesClause, params: ctesParams } = this.aggregations.reduce<{
      ctes: string;
      params: string[];
    }>(
      ({ ctes, params }, aggregation) => {
        const { cte, params: cteParams } = this.getCtesAndParams(aggregation);
        return { ctes: `${ctes}\n${cte}`, params: params.concat(cteParams) };
      },
      { ctes: '', params: [] },
    );

    const { clause: whereClause, params: whereParams } = this.getBaseWhereClauseAndParams();
    // We use INNER JOINs here as it's more performant than a large WHERE IN clause (https://dba.stackexchange.com/questions/91247/optimizing-a-postgres-query-with-a-large-in)
    const baseAnalytics = `(SELECT *, day_period as period from analytics
      ${SqlQuery.innerJoin('analytics', 'entity_code', this.entityCodes)}
      ${SqlQuery.innerJoin('analytics', 'data_element_code', this.dataElementCodes)}
      ${whereClause}) as base_analytics`;
    const baseAnalyticsParams = this.entityCodes.concat(this.dataElementCodes).concat(whereParams);

    const wrapAnalyticsInAggregation = (analytics: string, aggregation: QueryAggregation) =>
      `(${this.getAggregationSelect(aggregation)}
      FROM
      ${analytics}
      ${this.getAggregationJoin(aggregation)}
      ${this.getAggregationGroupByClause(aggregation)}) as a${aggregation.stackId}`;

    const query = `
      ${ctesClause}
      SELECT ${this.getAliasedColumns()}
      FROM ${this.aggregations.reduce(wrapAnalyticsInAggregation, baseAnalytics)}
      ORDER BY date;
     `;
    const params = ctesParams.concat(baseAnalyticsParams);

    return { query, params };
  }
}
