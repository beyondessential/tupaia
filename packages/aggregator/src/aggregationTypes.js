const BASIC_SCHEMA_CONFIG = {
  type: 'object',
  dataSourceEntityType: {
    type: 'string',
  },
  aggregationEntityType: {
    type: 'string',
  },
};

const GROUP_SCHEMA = {
  required: ['dataSourceEntityType', 'aggregationEntityType'],
};

const DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA = {
  required: ['dataSourceEntityType'],
};

const OFFSET_PERIOD_SCHEMA = {
  offset: {
    type: 'number',
  },
  periodType: {
    type: 'string',
  },
  required: ['dataSourceEntityType', 'offset', 'periodType'],
};

const getSchema = (aggregationType, otherConfigs = {}) => {
  const config = { ...BASIC_SCHEMA_CONFIG, ...otherConfigs };
  return {
    additionalProperties: false,
    properties: {
      type: { const: aggregationType },
      config,
    },
  };
};

const AGGREGATION_TYPES_CONFIG = [
  {
    code: 'COUNT_PER_ORG_GROUP',
    description:
      'Count the number of data in child entities within selected period, then sum and group by ancestor entities (aggregationEntityType)',
    schema: GROUP_SCHEMA,
  },
  {
    code: 'COUNT_PER_PERIOD_PER_ORG_GROUP',
    description:
      'Count the number of data in child entities within selected period, then sum and group by ancestor entities (aggregationEntityType) and period',
    schema: GROUP_SCHEMA,
  },
  {
    code: 'FINAL_EACH_DAY_FILL_EMPTY_DAYS',
    description:
      'Get the latest response for each day within selected period, fill each day with the latest value till current date',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
  {
    code: 'FINAL_EACH_DAY',
    description: 'Get the latest response for each day within selected period',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
  {
    code: 'FINAL_EACH_MONTH_FILL_EMPTY_MONTHS',
    description:
      'Get the latest response for each month within selected period, fill each month with the latest value till current month',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
  {
    code: 'FINAL_EACH_MONTH_PREFER_DAILY_PERIOD', // I.e. use 20180214 over 201802
    description: 'Only used by preaggregation',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
  {
    code: 'FINAL_EACH_MONTH',
    description: 'Get the latest response for each month within selected period',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
  {
    code: 'FINAL_EACH_QUARTER_FILL_EMPTY_QUARTERS',
    description:
      'Get the latest response for each quarter within selected period, fill each quarter with the latest value till current quarter',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
  {
    code: 'FINAL_EACH_QUARTER',
    description: 'Get the latest response for each quarter within selected period',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
  {
    code: 'FINAL_EACH_WEEK_FILL_EMPTY_WEEKS',
    description:
      'Get the latest response for each week within selected period, fill each week with the latest value till current week',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
  {
    code: 'FINAL_EACH_WEEK',
    description: 'Get the latest response for each week within selected period',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
  {
    code: 'FINAL_EACH_YEAR_FILL_EMPTY_YEARS',
    description:
      'Get the latest response for each year within selected period, fill each year with the latest value till current year',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
  {
    code: 'FINAL_EACH_YEAR',
    description: 'Get the latest response for each year within selected period',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
  {
    code: 'MOST_RECENT_PER_ORG_GROUP',
    description: 'Legacy aggregation type, only used in legacy data builder',
  },
  {
    code: 'MOST_RECENT',
    description: 'Get the latest data within selected period',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
  {
    code: 'OFFSET_PERIOD',
    description: 'Modify the period from the data',
    schema: OFFSET_PERIOD_SCHEMA,
  },
  {
    code: 'RAW',
    description: 'Raw data',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
  {
    code: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
    description:
      'Get the raw data for child entities (dataSourceEntityType) within selected period, then replace the orgunit code with the requested org unit code (aggregationEntityType)',
    schema: GROUP_SCHEMA,
  },
  {
    code: 'SUM_EACH_QUARTER',
    description: 'Sum all data for each quarter within selected period',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
  {
    code: 'SUM_EACH_YEAR',
    description: 'Sum all data for each year within selected period',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
  {
    code: 'SUM_EACH_MONTH',
    description: 'Sum all data for each month within selected period',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
  {
    code: 'SUM_EACH_WEEK',
    description: 'Sum all data for each week within selected period',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
  {
    code: 'SUM_MOST_RECENT_PER_FACILITY',
    description: 'Legacy aggregation type, only used in legacy data builder',
  },
  {
    code: 'SUM_PER_ORG_GROUP',
    description:
      'Group and sum data by ancestor entities (aggregationEntityType) within selected period',
    schema: GROUP_SCHEMA,
  },
  {
    code: 'SUM_PER_PERIOD_PER_ORG_GROUP',
    description:
      'Group and sum data within selected period by ancestor entities (aggregationEntityType) and period',
    schema: GROUP_SCHEMA,
  },
  {
    code: 'SUM_PREVIOUS_EACH_DAY',
    description:
      'Sum data including previous data (prior to the date range selected in date picker)',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
  {
    code: 'SUM_UNTIL_CURRENT_DAY',
    description: 'Sum data till current day ( even after the date range selected in date picker)',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
  {
    code: 'SUM',
    description: 'Sum all data',
    schema: DATA_SOURCE_ENTITY_TYPE_REQUIRED_SCHEMA,
  },
];

export const AGGREGATION_TYPES_META_DATA = AGGREGATION_TYPES_CONFIG.map(
  ({ schema, code, ...restOfConfigs }) => ({
    schema: getSchema(code, schema),
    code,
    ...restOfConfigs,
  }),
);

export const AGGREGATION_TYPES = Object.fromEntries(
  AGGREGATION_TYPES_META_DATA.map(({ code }) => [code, code]),
);
