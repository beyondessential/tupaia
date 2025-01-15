const FILTER_TYPE_TO_METHOD = {
  '=': (entity, field, filterValue) => entity[field] === filterValue,
  in: (entity, field, filterValue) => filterValue.includes(entity[field]),
};

const applyFilter = (entities, field, operator, value) => {
  const filterMethod = FILTER_TYPE_TO_METHOD[operator];
  return filterMethod ? entities.filter(entity => filterMethod(entity, field, value)) : entities;
};

const filterByObjectField = (entities, field, filterValue) => {
  if (typeof filterValue !== 'object') {
    throw new Error(`Filtering by ${field} expects an object`);
  }

  let filteredEntities = entities;
  Object.entries(filterValue).forEach(([key, value]) => {
    filteredEntities = filteredEntities.filter(e => e[field][key] === value);
  });
  return filteredEntities;
};

const filterByPlainField = (entities, field, filterValue, operator = '=') => {
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
 * ```
 * {
 *    code: 'ABC'
 *    attributes: { type: 'Primary' },
 * }
 * ```
 */
export const filterEntities = (entities, entityFilter) => {
  let filteredEntities = entities;

  Object.entries(entityFilter).forEach(([field, filterValue]) => {
    switch (field) {
      case 'attributes':
        filteredEntities = filterByObjectField(filteredEntities, field, filterValue);
        break;
      default:
        filteredEntities = filterByPlainField(filteredEntities, field, filterValue);
        break;
    }
  });

  return filteredEntities;
};
