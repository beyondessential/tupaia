/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { SqlQuery } from './SqlQuery';

const VALUE_AGGREGATION_FUNCTIONS = {
  SUM: 'sum(value::numeric)::text',
  MOST_RECENT: 'most_recent(value, date)',
};

const COMMONLY_SUPPORTED_CONFIG_KEYS = ['dataSourceEntityType', 'dataSourceEntityFilter'];

const AGGREGATION_SWITCHES = {
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

const supportsConfig = (aggregationSwitch, config) => {
  if (!config) {
    return true;
  }

  const switchSupportedKeys = aggregationSwitch.supportedConfigKeys || [];
  return Object.keys(config).every(
    key => COMMONLY_SUPPORTED_CONFIG_KEYS.includes(key) || switchSupportedKeys.includes(key),
  );
};

export class AnalyticsFetchQuery {
  constructor(database, options) {
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
        const aggregationSwitch = AGGREGATION_SWITCHES[aggregation?.type];
        if (!aggregationSwitch || !supportsConfig(aggregationSwitch, aggregation?.config)) {
          break; // We only support chaining aggregations up to the last supported type
        }
        const dbAggregation = { type: aggregation?.type };
        dbAggregation.switch = AGGREGATION_SWITCHES[aggregation?.type]; // add internal switch
        dbAggregation.config = aggregation?.config; // add external config, supplied by client
        dbAggregation.stackId = i + 1;
        this.aggregations.push(dbAggregation);
      }
    }

    this.isAggregating = this.aggregations.length > 0;

    this.validate();
  }

  async fetch() {
    const { query, params } = this.buildQueryAndParams();

    const sqlQuery = new SqlQuery(query, params);

    return {
      analytics: await sqlQuery.executeOnDatabase(this.database),
      numAggregationsProcessed: this.aggregations.length,
    };
  }

  validate() {
    this.aggregations.forEach(aggregation => {
      if (aggregation.switch.aggregateEntities && !aggregation.config?.orgUnitMap) {
        throw new Error('When using entity aggregation you must provide an org unit map');
      }
    });
  }

  getEntityCodeField(aggregation) {
    return aggregation.switch.aggregateEntities ? 'aggregation_entity_code' : 'entity_code';
  }

  getCtesAndParams(aggregation) {
    if (!aggregation.switch.aggregateEntities) {
      return { cte: '', params: [] };
    }

    // if mapping from one set of entities to another, include the mapped codes as "aggregation_entity_code"
    const entityMap = aggregation.config.orgUnitMap;
    const columns = ['code', 'aggregation_entity_code'];
    const rows = Object.entries(entityMap).map(([key, value]) => [key, value.code]);
    const cte = `
      WITH entity_relations_a${aggregation.stackId} (${columns.join(', ')})
      AS (${SqlQuery.values(rows)})
    `;

    return { cte, params: rows.flat() };
  }

  getAliasedColumns() {
    return [
      `entity_code AS "entityCode"`,
      'data_element_code AS "dataElementCode"',
      'period',
      'value',
      'type',
    ].join(', ');
  }

  getAggregationSelect(aggregation) {
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

  getPeriodConditionsAndParams() {
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

  getBaseWhereClauseAndParams() {
    const { periodConditions, periodParams } = this.getPeriodConditionsAndParams();

    if (periodConditions.length === 0) {
      return { clause: '', params: [] };
    }

    return { clause: `WHERE ${periodConditions.join(' AND ')}`, params: periodParams };
  }

  getAggregationJoin(aggregation) {
    if (!aggregation.switch.aggregateEntities) {
      return '';
    }
    const previousTableName =
      aggregation.stackId === 1 ? 'base_analytics' : `a${aggregation.stackId - 1}`;
    const relationsTableName = `entity_relations_a${aggregation.stackId}`;
    return `INNER JOIN ${relationsTableName} on ${relationsTableName}.code = ${previousTableName}.entity_code`;
  }

  getAggregationGroupByClause(aggregation) {
    const groupByFields = [this.getEntityCodeField(aggregation), 'data_element_code'];
    const { groupByPeriodField } = aggregation.switch;
    if (groupByPeriodField) groupByFields.push(groupByPeriodField);
    return `GROUP BY ${groupByFields.join(', ')}`;
  }

  buildQueryAndParams() {
    const { ctes: ctesClause, params: ctesParams } = this.aggregations.reduce(
      ({ ctes, params }, aggregation) => {
        const { cte, params: cteParams } = this.getCtesAndParams(aggregation);
        return { ctes: `${ctes}\n${cte}`, params: params.concat(cteParams) };
      },
      { ctes: '', params: [] },
    );

    const { clause: whereClause, params: whereParams } = this.getBaseWhereClauseAndParams();
    const baseAnalytics = `(SELECT *, day_period as period from analytics
      ${SqlQuery.innerJoin('analytics', 'entity_code', this.entityCodes)}
      ${SqlQuery.innerJoin('analytics', 'data_element_code', this.dataElementCodes)}
      ${whereClause}) as base_analytics`;
    const baseAnalyticsParams = this.entityCodes.concat(this.dataElementCodes).concat(whereParams);

    const wrapAnalyticsInAggregation = (analytics, aggregation) =>
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
