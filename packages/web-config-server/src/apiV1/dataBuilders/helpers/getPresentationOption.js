import { checkValueSatisfiesCondition } from '@tupaia/utils';

const PRESENTATION_TYPES = {
  CONDITIONS: '$condition',
};

const CONDITION_TYPE_SOME = 'some';

// Check if the value satisfies all the conditions if condition is an object
const satisfyAllConditions = (conditions, value, opposite) => {
  return Object.entries(conditions).every(([operator, conditionalValue]) => {
    const result = checkValueSatisfiesCondition(value, { operator, value: conditionalValue });
    return opposite ? !result : result;
  });
};

const satisfyAllConditionsForSomeItems = (values, condition) => {
  // Check at least one item meets condition, but not all
  const conditionsInSome = condition[CONDITION_TYPE_SOME];
  const someMeetCondition = values.some(value => satisfyAllConditions(conditionsInSome, value));
  const someMeetOppositeCondition = values.some(value =>
    satisfyAllConditions(conditionsInSome, value, true),
  );
  return someMeetCondition && someMeetOppositeCondition;
};

const getPresentationOptionFromCondition = (config, values) => {
  if (!values) return null;
  const { conditions = [] } = config;
  const option = conditions.find(({ condition }) => {
    if (typeof condition === 'object') {
      if (condition[CONDITION_TYPE_SOME]) {
        return satisfyAllConditionsForSomeItems(values, condition);
      }
      return values.every(value => satisfyAllConditions(condition, value));
    }

    throw new Error(
      `Please specify condition as object when using 'type: ${PRESENTATION_TYPES.CONDITION}' in 'dataBuilderConfig'`,
    );
  });
  return option.key;
};

// This function has same structure as @web-frontend condition checking in 'color.js'
//
// It performs condition matching for frontend presentation option,
// which can reduce the frontend loading and calculation time.
export const getPresentationOption = (categoryAggregatorConfig, values) => {
  switch (categoryAggregatorConfig.type) {
    case PRESENTATION_TYPES.CONDITIONS:
      return getPresentationOptionFromCondition(categoryAggregatorConfig, values);
    default:
      return null;
  }
};
