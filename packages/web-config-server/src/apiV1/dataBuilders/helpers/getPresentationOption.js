import { checkValueSatisfiesCondition } from '@tupaia/utils';

export const PRESENTATION_TYPES = {
  OBJECT_CONDITION: 'objectCondition',
};

const OBJECT_CONDITION_TYPE_SOME = 'some';

// Check if the value satisfies all the conditions if condition is an object
const satisfyAllConditions = (conditions, value, opposite) => {
  return Object.entries(conditions).every(([operator, conditionalValue]) => {
    const result = checkValueSatisfiesCondition(value, { operator, value: conditionalValue });
    return opposite ? !result : result;
  });
};

const satisfyAllConditionsForSomeItems = (object, condition) => {
  // Check at least one item meets condition, but not all
  const conditionsInSome = condition[OBJECT_CONDITION_TYPE_SOME];
  const someMeetCondition = Object.values(object).some(value =>
    satisfyAllConditions(conditionsInSome, value),
  );
  const someMeetOppositeCondition = Object.values(object).some(value =>
    satisfyAllConditions(conditionsInSome, value, true),
  );
  return someMeetCondition && someMeetOppositeCondition;
};

const getPresentationOptionFromObjectCondition = (options, object) => {
  if (!object) return { key: '' };
  const { conditions = [] } = options;

  const option = conditions.find(({ condition }) => {
    if (typeof condition === 'object') {
      if (condition[OBJECT_CONDITION_TYPE_SOME]) {
        return satisfyAllConditionsForSomeItems(object, condition);
      }
      return Object.values(object).every(value => satisfyAllConditions(condition, value));
    }

    throw new Error(
      `Please specify condition as object when using 'type: ${PRESENTATION_TYPES.OBJECT_CONDITION}' in presentation config`,
    );
  });
  return option;
};

// Pre calculation for viewJson's presentation option, which will return a specific condition,
// which can reduce the frontend loading and calculation time.
export const getPresentationOption = (options, value) => {
  switch (options.type) {
    case PRESENTATION_TYPES.OBJECT_CONDITION:
      return getPresentationOptionFromObjectCondition(options, value);
    default:
      return { key: '' };
  }
};
