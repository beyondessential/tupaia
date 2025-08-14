import { checkValueSatisfiesCondition } from '@tupaia/utils';
import { CONDITION } from '/apiV1/dataBuilders/constants';

const PRESENTATION_TYPES = {
  CONDITION,
};

const CONDITION_TYPE_SOME_NOT_ALL = 'someNotAll';

const checkValueSatisfiesAllConditions = (value, conditions) => {
  return Object.entries(conditions).every(([operator, conditionalValue]) =>
    checkValueSatisfiesCondition(value, { operator, value: conditionalValue }),
  );
};

const satisfyAllConditionsForSomeItems = (values, condition) => {
  // Check at least one item meets condition, but not all
  const conditionsInSome = condition[CONDITION_TYPE_SOME_NOT_ALL];
  const someMeetCondition = values.some(value =>
    checkValueSatisfiesAllConditions(value, conditionsInSome),
  );
  const someMeetOppositeCondition = !values.every(value =>
    checkValueSatisfiesAllConditions(value, conditionsInSome),
  );
  return someMeetCondition && someMeetOppositeCondition;
};

const getPresentationOptionFromCondition = (config, values) => {
  const { conditions = [] } = config;
  const option = conditions.find(({ condition }) => {
    if (typeof condition === 'object') {
      if (condition[CONDITION_TYPE_SOME_NOT_ALL]) {
        return satisfyAllConditionsForSomeItems(values, condition);
      }
      return values.every(value => checkValueSatisfiesAllConditions(value, condition));
    }

    return values.every(value =>
      checkValueSatisfiesAllConditions(value, { operator: '=', value: condition }),
    );
  });
  return option?.key;
};

// This function has same structure as @tupaia-web condition checking in 'color.js'
//
// It performs condition matching for frontend presentation option,
// which can reduce the frontend loading and calculation time.
export const getCategoryPresentationOption = (config, values) => {
  switch (config.type) {
    case PRESENTATION_TYPES.CONDITION:
      return getPresentationOptionFromCondition(config, values);
    default:
      throw new Error(`Invalid categoryAggregatorConfig type: ${config.type}`);
  }
};
