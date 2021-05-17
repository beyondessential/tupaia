/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DataFetchQuery, ANSWER_SPECIFIC_FIELDS } from './DataFetchQuery';

const AGGREGATIONS = {
  FINAL_EACH_DAY: {
    groupByPeriodField: 'day_period',
    getLatestPerPeriod: true,
  },
  FINAL_EACH_WEEK: {
    groupByPeriodField: 'week_period',
    getLatestPerPeriod: true,
  },
  FINAL_EACH_MONTH: {
    groupByPeriodField: 'month_period',
    getLatestPerPeriod: true,
  },
  FINAL_EACH_YEAR: {
    groupByPeriodField: 'year_period',
    getLatestPerPeriod: true,
  },
  MOST_RECENT: {
    getLatestPerPeriod: true,
  },
  SUM_PER_ORG_GROUP: {
    sum: true,
    aggregateEntities: true,
  },
};

export class AnalyticsFetchQuery extends DataFetchQuery {
  constructor(database, options) {
    super(database, options);

    const firstAggregation = options.aggregations?.[0];
    this.isAggregating = firstAggregation;

    if (this.isAggregating) {
      // add internal config, fixed per aggregation type
      this.firstAggregation = AGGREGATIONS[firstAggregation.type];

      // add any external config, supplied by client
      this.firstAggregation.config = firstAggregation.config;
    }

    this.validate();
  }

  validate() {
    if (this.firstAggregation?.aggregateEntities && !this.firstAggregation.config.orgUnitMap) {
      throw new Error('When using entity aggregation you must provide an org unit map');
    }
  }

  getEntityCodeField() {
    return this.firstAggregation?.aggregateEntities ? 'aggregation_entity_code' : 'entity_code';
  }

  getCommonFields() {
    return [this.getEntityCodeField(), 'data_element_code'];
  }

  getEntityCommonTableExpression() {
    // if mapping from one set of entities to another, include the mapped codes as "aggregation_entity_code"
    const isAggregatingEntities = this.firstAggregation?.aggregateEntities;
    const entityMap = isAggregatingEntities && this.firstAggregation.config.orgUnitMap;
    const columns = isAggregatingEntities ? ['code', 'aggregation_entity_code'] : ['code'];
    const rows = isAggregatingEntities
      ? Object.entries(entityMap).map(([key, value]) => [key, value.code])
      : this.entityCodes.map(entityCode => [entityCode]);

    return `
      WITH entity_codes_and_relations (${columns.join(', ')})
      AS (${this.parameteriseValues(rows)})
    `;
  }

  getAliasedColumns() {
    return [
      `${this.getEntityCodeField()} AS "entityCode"`,
      'data_element_code AS "dataElementCode"',
      'date',
      'value',
      'type',
    ].join(', ');
  }

  getA1Select() {
    if (!this.isAggregating) {
      return `SELECT ${[...this.getCommonFields(), ...ANSWER_SPECIFIC_FIELDS].join(', ')}`;
    }
    const { groupByPeriodField, sum } = this.firstAggregation;
    const fields = [...this.getCommonFields()];

    if (groupByPeriodField) {
      fields.push(groupByPeriodField);
    }

    if (sum) {
      fields.push(
        ...['SUM(value::NUMERIC)::text as value', 'MAX(date) as date', 'MAX(type) as type'],
      );
    }
    return `SELECT ${fields.join(', ')}`;
  }

  getA1InnerJoins() {
    const joins = [
      'INNER JOIN entity_codes_and_relations ON entity_codes_and_relations.code = analytics.entity_code',
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

  getA1WhereClause() {
    const { periodConditions, periodParams } = this.getPeriodConditionsAndParams();

    if (periodConditions.length === 0) return '';

    this.paramsArray.push(...periodParams);
    return `WHERE ${periodConditions.join(' AND ')}`;
  }

  getA1GroupByClause = () => {
    if (!this.isAggregating) return '';

    const groupByFields = [...this.getCommonFields()];
    const { groupByPeriodField } = this.firstAggregation;
    if (groupByPeriodField) groupByFields.push(groupByPeriodField);
    return `GROUP BY ${groupByFields.join(', ')}`;
  };

  getLatestPerPeriodClause() {
    if (!this.isAggregating || !this.firstAggregation.getLatestPerPeriod) return '';

    // add where condition for each non-calculated table selected in a1
    const joinFields = [...this.getCommonFields()];
    const { groupByPeriodField } = this.firstAggregation;
    if (groupByPeriodField) joinFields.push(groupByPeriodField);
    const joinConditions = joinFields.map(field => `${field} = a1.${field}`);

    // add start/end date clauses to limit results and speed things up
    const { periodConditions, periodParams } = this.getPeriodConditionsAndParams();
    this.paramsArray.push(...periodParams);

    const conditions = [...joinConditions, ...periodConditions];

    const fields = this.firstAggregation.sum
      ? ANSWER_SPECIFIC_FIELDS.filter(field => field !== 'value')
      : ANSWER_SPECIFIC_FIELDS;

    return `
      CROSS JOIN LATERAL (
        SELECT ${fields}
        FROM analytics
        INNER JOIN entity_codes_and_relations ON entity_codes_and_relations.code = analytics.entity_code
        WHERE ${conditions.join('\n      AND ')}
        ORDER BY date DESC
        LIMIT 1
      ) as latestPerPeriod
    `;
  }

  build() {
    this.query = `
      ${this.getEntityCommonTableExpression()}
      SELECT ${this.getAliasedColumns()}
      FROM (
        ${this.getA1Select()}
        FROM analytics
          ${this.getA1InnerJoins()}
          ${this.getA1WhereClause()}
          ${this.getA1GroupByClause()}
      ) as a1
      ${this.getLatestPerPeriodClause()}
      ORDER BY date;
     `;
  }
}
