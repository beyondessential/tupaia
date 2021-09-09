import { checkValueSatisfiesCondition } from '@tupaia/utils';

/**
 * @param {Event[]} events
 * @param {Conditions} [conditions]
 * @returns {Event[]}
 */
export const getEventsThatSatisfyConditions = (events, conditions) => {
  const { dataValues: valueConditions = {} } = conditions || {};

  const eventHasTargetValues = event =>
    Object.entries(valueConditions).every(([dataElement, condition]) =>
      checkValueSatisfiesCondition(event.dataValues[dataElement], condition),
    );

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
