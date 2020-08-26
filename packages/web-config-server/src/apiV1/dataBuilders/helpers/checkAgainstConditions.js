import isPlainObject from 'lodash.isplainobject';

const OPERATOR_TO_VALUE_CHECK = {
  '=': (value, target) => value === target,
  '>=': (value, target) => value >= target,
  '<=': (value, target) => value <= target,
  '>': (value, target) => value > target,
  '<': (value, target) => value < target,
  range: (value, target) => target[0] <= value && value <= target[1],
  rangeExclusive: (value, target) => target[0] < value && value < target[1],
  regex: (value, target) => !!value.match(target),
  in: (value, target) => target.includes(value),
};

const NUMERIC_OPERATORS = ['>=', '<=', '>', '<', 'range', 'rangeExclusive'];

const ANY_VALUE_CONDITION = '*';

export const checkValueSatisfiesCondition = (value, condition) => {
  if (value === undefined) return false;

  if (!isPlainObject(condition)) {
    return (condition === ANY_VALUE_CONDITION && value !== '') || value === condition;
  }

  const { operator, value: targetValue } = condition;

  const checkValue = OPERATOR_TO_VALUE_CHECK[operator];
  if (!checkValue) {
    throw new Error(`Unknown operator: '${operator}'`);
  }

  // Prevents '' (no data) being cast to 0 and giving incorrect results
  if (NUMERIC_OPERATORS.includes(operator) && value === '') return false;

  return checkValue(value, targetValue);
};

/**
 * @param {Event[]} events
 * @param {Conditions} [conditions]
 * @returns {Event[]}
 */
export const getEventsThatSatisfyConditions = (events, conditions) => {
  const { dataValues: valueConditions = {} } = conditions || {};
  const eventHasTargetValues = ({ dataValues }) =>
    Object.entries(valueConditions).every(([dataElement, condition]) => {
      const dataValue = Array.isArray(dataValues)
        ? dataValues.find(dv => dv.dataElement === dataElement)
        : dataValues[dataElement];
      const value = isPlainObject(dataValue) ? dataValue.value : dataValue;
      return checkValueSatisfiesCondition(value, condition);
    });

  return events.filter(eventHasTargetValues);
};

/**
 * @param {AnalyticsResult[]} analytics
 * @param {Conditions} [conditions]
 * @returns {AnalyticsResult[]}
 */
export const getAnalyticsThatSatisfyConditions = (analytics, conditions) => {
  const { dataValues = [], valueOfInterest } = conditions || {};
  const analyticHasTargetValue = ({ dataElement, value }) => {
    if (!dataValues.includes(dataElement)) return false;
    return checkValueSatisfiesCondition(value, valueOfInterest);
  };

  return analytics.filter(analyticHasTargetValue);
};

/**
 * @param {Event[]} events
 * @param {Conditions} [conditions]
 * @returns {number}
 */
export const countEventsThatSatisfyConditions = (events, conditions) => {
  return getEventsThatSatisfyConditions(events, conditions).length;
};

/**
 * @param {AnalyticsResult[]} analytics
 * @param {Conditions} [conditions]
 * @returns {number}
 */
export const countAnalyticsThatSatisfyConditions = (analytics, conditions) => {
  return getAnalyticsThatSatisfyConditions(analytics, conditions).length;
};

/**
 * @param {Object} groupedAnalytics
 * @param {Conditions} [conditions]
 * @returns {number}
 */
export const countAnalyticsGroupsThatSatisfyConditions = (groupedAnalytics, conditions = {}) => {
  const { dataValues: valueConditions = {} } = conditions;

  const groupedAnalyticsHasTargetValues = analytics =>
    Object.entries(valueConditions).every(([dataElement, condition]) => {
      const analytic = analytics.find(({ dataElement: de }) => de === dataElement);

      const { value } = analytic || {};
      return checkValueSatisfiesCondition(value, condition);
    });
  return Object.values(groupedAnalytics).filter(groupedAnalyticsHasTargetValues).length;
};
