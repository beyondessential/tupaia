import isPlainObject from 'lodash.isplainobject';

export const OPERATOR_TO_VALUE_CHECK = {
  '>=': (value, target) => value >= target,
  '<': (value, target) => value < target,
  range: (value, target) => target[0] <= value && value <= target[1],
  regex: (value, target) => value.match(target),
};

const ANY_VALUE_CONDITION = '*';

const checkValueSatisfiesCondition = (value, condition) => {
  if (!isPlainObject(condition)) {
    return condition === ANY_VALUE_CONDITION || value === condition;
  }

  const { operator, value: targetValue } = condition;

  const checkValue = OPERATOR_TO_VALUE_CHECK[operator];
  if (!checkValue) {
    throw new Error(`Unknown operator: '${operator}'`);
  }

  return checkValue(value, targetValue);
};

/**
 * @param {Event[]} events
 * @param {Conditions} [conditions]
 * @returns {number}
 */
export const countEventsThatSatisfyConditions = (events, conditions) => {
  const { dataValues: valueConditions = {} } = conditions || {};
  const eventHasTargetValues = ({ dataValues }) =>
    Object.entries(valueConditions).every(([dataElement, condition]) => {
      const { value } = dataValues[dataElement] || {};
      return value && checkValueSatisfiesCondition(value, condition);
    });

  return events.filter(eventHasTargetValues).length;
};

/**
 * @param {AnalyticsResult[]} analytics
 * @param {Conditions} [conditions]
 * @returns {number}
 */
export const countAnalyticsThatSatisfyConditions = (analytics, conditions) => {
  const { dataValues = [], valueOfInterest } = conditions || {};
  const analyticHasTargetValue = ({ dataElement, value }) => {
    if (!dataValues.includes(dataElement)) return false;
    return checkValueSatisfiesCondition(value, valueOfInterest);
  };

  return analytics.filter(analyticHasTargetValue).length;
};
