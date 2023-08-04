/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import pluralize from 'pluralize';

import { TYPES } from '../types';
import { generateTestId } from './generateTestId';
import { generateValueOfType } from './generateValueOfType';

const { DISASTER, ENTITY, SURVEY_RESPONSE } = TYPES;

const CUSTOM_DUMMY_VALUES = {
  [DISASTER]: {
    type: 'cyclone',
  },
  [ENTITY]: {
    type: 'facility', // default testing entity should be facility
    country_code: 'DL', // use demo land by default in testing
  },
  [SURVEY_RESPONSE]: {
    timezone: 'Africa/Abidjan', // equivalent to GMT
  },
};

const processDefaultValue = defaultValue => {
  const [preColonValue, type] = defaultValue.split('::');
  const value = preColonValue.replace(/^'/, '').replace(/'$/, '');

  // handle exceptional types
  switch (type) {
    case 'jsonb':
      return JSON.parse(value);
    case 'text[]':
      return value === '{}' ? [] : value.substring(1, value.length - 1).split(','); // '{a,b}' -> [ 'a', 'b' ]
    case 'text, clock_timestamp()) * (1000)':
      return Date.now();
    default:
      return value;
  }
};

const generateDummyRecord = async (model, overrides = {}) => {
  const schema = await model.fetchSchema();
  // This is a field managed by our analytics materialized view, see also MaterializedViewLogDatabaseModel
  delete schema.m_row$;
  const dummyRecord = {};
  Object.entries(schema).forEach(([fieldName, columnInfo]) => {
    const getValue = () => {
      // in order of precedence, we want to use:
      // - the value passed in explicitly in overrides, generally hard coded for the specific test
      if (overrides[fieldName] !== undefined) return overrides[fieldName];
      // - the value stored in CUSTOM_DUMMY_VALUES, even if that is 'null'
      const { databaseType } = model;
      if (
        CUSTOM_DUMMY_VALUES[databaseType] &&
        CUSTOM_DUMMY_VALUES[databaseType][fieldName] !== undefined
      )
        return CUSTOM_DUMMY_VALUES[databaseType][fieldName];
      // - the default value from the database schema
      if (columnInfo.defaultValue !== null) return processDefaultValue(columnInfo.defaultValue);
      // - a test id if the field name indicates that's what it should get
      if (fieldName === 'id') return generateTestId();
      // - null if this is a foreign key and has not been explicitly defined by the user
      if (fieldName.endsWith('_id')) return null;
      // - generate a sensible value based on the database column type
      return generateValueOfType(columnInfo.type, columnInfo);
    };
    dummyRecord[fieldName] = getValue();
  });
  return dummyRecord;
};

/**
 *
 * @param {*} model
 * @param {*?} data
 * @returns
 */
export const upsertDummyRecord = async (model, data) => {
  const generatedData = await generateDummyRecord(model, data);
  return model.updateOrCreate({ id: generatedData.id }, generatedData);
};

/**
 *
 * @param {*} model
 * @param {*} findCriteria
 * @param {*?} data
 * @returns
 */
export const findOrCreateDummyRecord = async (model, findCriteria, data) => {
  const generatedData = await generateDummyRecord(model, { ...findCriteria, ...data });
  return model.findOrCreate(findCriteria, generatedData);
};

export const findOrCreateRecords = async (models, recordsByType) => {
  const data = {};

  for (const [type, records] of Object.entries(recordsByType)) {
    const pluralType = pluralize(type);
    data[pluralType] = [];
    for (const record of records) {
      data[pluralType].push(await findOrCreateDummyRecord(models[type], record));
    }
  }

  return data;
};

/**
 * Generates test data, and stores it in the database. Uses test ids so that all can be cleanly
 * wiped afterwards. Any missing fields on the records passed in are generated randomly or using
 * sensible defaults, using the logic in upsertDummyRecord
 */
export const populateTestData = async (models, recordsByType) => {
  const data = {};

  // process sequentially, as some inserts may depend on earlier foreign keys being inserted
  for (const [type, records] of Object.entries(recordsByType)) {
    const pluralType = pluralize(type);
    data[pluralType] = [];
    for (const record of records) {
      data[pluralType].push(await upsertDummyRecord(models[type], record));
    }
  }

  return data;
};
