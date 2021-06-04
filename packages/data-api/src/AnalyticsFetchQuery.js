/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DataFetchQuery } from './DataFetchQuery';

const VALUE_AGGREGATION_FUNCTIONS = {
  SUM: 'sum(value::numeric)::text',
  MOST_RECENT: 'most_recent(value, date)',
};

const AGGREGATION_SWITCHES = {
  FINAL_EACH_DAY: {
    groupByPeriodField: 'day_period',
    aggregationFunction: VALUE_AGGREGATION_FUNCTIONS.MOST_RECENT,
  },
  FINAL_EACH_WEEK: {
    groupByPeriodField: 'week_period',
    aggregationFunction: VALUE_AGGREGATION_FUNCTIONS.MOST_RECENT,
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
  },
  SUM_PER_ORG_GROUP: {
    aggregationFunction: VALUE_AGGREGATION_FUNCTIONS.SUM,
    aggregateEntities: true,
  },
  SUM_PER_PERIOD_PER_ORG_GROUP: {
    aggregationFunction: VALUE_AGGREGATION_FUNCTIONS.SUM,
    aggregateEntities: true,
    groupByPeriodField: 'day_period', // can assume first internal aggregation period type is daily
  },
};

export class AnalyticsFetchQuery extends DataFetchQuery {
  constructor(database, options) {
    super(database, options);

    this.aggregations = [];
    for (let i = 0; i < options.aggregations.length; i++) {
      const aggregation = options.aggregations[i];
      if (!AGGREGATION_SWITCHES[aggregation?.type]) {
        break; // We only support chaining aggregations if all aggregations are supported type
      }
      const dbAggregation = { type: aggregation?.type };
      dbAggregation.switches = AGGREGATION_SWITCHES[aggregation?.type]; // add internal switches
      dbAggregation.config = aggregation?.config; // add external config, supplied by client
      dbAggregation.stackId = i + 1;
      this.aggregations.push(dbAggregation);
    }
    this.isAggregating = this.aggregations.length > 0;

    this.validate();
  }

  validate() {
    this.aggregations.forEach(aggregation => {
      if (aggregation.switches?.aggregateEntities && !aggregation.config?.orgUnitMap) {
        throw new Error('When using entity aggregation you must provide an org unit map');
      }
    });
  }

  getEntityCodeField(aggregation) {
    return aggregation.switches?.aggregateEntities ? 'aggregation_entity_code' : 'entity_code';
  }

  getEntityCommonTableExpression(aggregation) {
    if (!aggregation.switches.aggregateEntities) {
      return '';
    }
    // if mapping from one set of entities to another, include the mapped codes as "aggregation_entity_code"
    const entityMap = aggregation.config.orgUnitMap;
    const columns = ['code', 'aggregation_entity_code'];
    const rows = Object.entries(entityMap).map(([key, value]) => [key, value.code]);
    return `
      WITH entity_relations_a${aggregation.stackId} (${columns.join(', ')})
      AS (${this.parameteriseValues(rows)})
    `;
  }

  getAliasedColumns() {
    return [
      `entity_code AS "entityCode"`,
      'data_element_code AS "dataElementCode"',
      'date',
      'value',
      'type',
    ].join(', ');
  }

  getAggregationSelect(aggregation) {
    const { aggregationFunction } = aggregation.switches;
    const fields = [];
    fields.push(`${this.getEntityCodeField(aggregation)} as entity_code`);
    fields.push(`data_element_code`);
    fields.push(`${aggregationFunction} as value`);
    fields.push('MAX(type) as type');
    fields.push('MAX(day_period) as day_period');
    fields.push('MAX(week_period) as week_period');
    fields.push('MAX(month_period) as month_period');
    fields.push('MAX(year_period) as year_period');
    fields.push('MAX(date) as date');

    return `SELECT ${fields.join(', ')}`;
  }

  getBaseInnerJoins() {
    const joins = [
      this.createInnerJoin(this.entityCodes, 'entity_code'),
      this.createInnerJoin(this.dataElementCodes, 'data_element_code'),
    ];
    return joins.join('\n');
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

  getBaseWhereClause() {
    const { periodConditions, periodParams } = this.getPeriodConditionsAndParams();

    if (periodConditions.length === 0) return '';

    this.paramsArray.push(...periodParams);
    return `WHERE ${periodConditions.join(' AND ')}`;
  }

  getAggregationJoin(aggregation) {
    if (!aggregation.switches.aggregateEntities) {
      return '';
    }
    const previousTableName =
      aggregation.stackId === 1 ? 'analytics' : `a${aggregation.stackId - 1}`;
    const relationsTableName = `entity_relations_a${aggregation.stackId}`;
    return `INNER JOIN ${relationsTableName} on ${relationsTableName}.code = ${previousTableName}.entity_code`;
  }

  getAggregationGroupByClause(aggregation) {
    const groupByFields = [this.getEntityCodeField(aggregation), 'data_element_code'];
    const { groupByPeriodField } = aggregation.switches;
    if (groupByPeriodField) groupByFields.push(groupByPeriodField);
    return `GROUP BY ${groupByFields.join(', ')}`;
  }

  build() {
    const baseAnalytics = `analytics
      ${this.getBaseInnerJoins()}
      ${this.getBaseWhereClause()}`;

    const wrapAnalyticsInAggregation = (analytics, aggregation) =>
      `(${this.getAggregationSelect(aggregation)} 
      FROM 
      ${analytics}
      ${this.getAggregationJoin(aggregation)}
      ${this.getAggregationGroupByClause(aggregation)}) as a${aggregation.stackId}`;

    this.query = `
      ${this.aggregations.map(this.getEntityCommonTableExpression).join('\n')}
      SELECT ${this.getAliasedColumns()}
      FROM ${this.aggregations.reduce(wrapAnalyticsInAggregation, baseAnalytics)}
      ORDER BY date;
     `;
  }
}
