/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */
const FILTER_TYPE_TO_METHOD = {
  '=': (entity, field, filterValue) => entity[field] === filterValue,
  in: (entity, field, filterValue) => filterValue.includes(entity[field]),
};

const applyFilter = (entities, field, operator, value) => {
  const filterMethod = FILTER_TYPE_TO_METHOD[operator];

  return filterMethod ? entities.filter(entity => filterMethod(entity, field, value)) : entities;
};

/**
 * Attributes is a special case because it is in JSON format and might have multiple fields to filter.
 * Eg:
 * attributes: {
 *    type: 'primary',
 *    name: 'Example
 * }
 */
const filterEntitiesByAttributes = (entities, attributesFilter) => {
  if (typeof attributesFilter !== 'object') {
    throw new Error('Filtering by attributes expects an object');
  }

  let filteredEntities = entities;

  Object.entries(attributesFilter).forEach(([attribute, filterCriteria]) => {
    filteredEntities = filteredEntities.filter(e => e.attributes[attribute] === filterCriteria);
  });

  return filteredEntities;
};

/**
 * Right now we only support filtering entities with operator '=' (eg: {code: 'ABC'}).
 * But in the future, if we need to support filtering by different operators, is not difficult to extend.
 * We only have to extend it to be an object to include operators (eg: {code : {in: ['ABC', 'DEF']]}}}).
 * We shouldn't have to migrate any existing `entityFilter`, it should still support the existing simple format.
 */
const filterEntitiesByField = (entities, field, filterValue, operator = '=') => {
  if (typeof filterValue === 'object') {
    let filteredEntities = entities;

    Object.entries(filterValue).forEach(([individualFilterOperator, individualFilterValue]) => {
      filteredEntities = applyFilter(
        filteredEntities,
        field,
        individualFilterOperator,
        individualFilterValue,
      );
    });

    return filteredEntities;
  }

  return applyFilter(entities, field, operator, filterValue);
};

/**
 * Example entityFilter format:
 * dataSourceEntityFilter: {
 *    attributes: {
 *        type: 'primary'
 *    },
 *    code: 'ABC'
 * }
 */
export const filterEntities = (entities, entityFilter) => {
  let filteredEntities = entities;

  Object.entries(entityFilter).forEach(([field, filterValue]) => {
    switch (field) {
      case 'attributes':
        filteredEntities = filterEntitiesByAttributes(filteredEntities, filterValue);
        break;
      default:
        filteredEntities = filterEntitiesByField(filteredEntities, field, filterValue);
        break;
    }
  });

  return filteredEntities;
};

export const checkEntityAgainstConditions = (entity, conditions = {}) => {
  return filterEntities([entity], conditions).length === 1;
};
