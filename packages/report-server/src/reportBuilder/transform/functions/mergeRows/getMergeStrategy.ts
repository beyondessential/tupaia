import { getColumnMatcher } from '../helpers';
import { mergeStrategies } from './mergeStrategies';

const buildIsGroupByField = (groupBy: string | string[] | undefined) => {
  if (groupBy === undefined) {
    return () => false;
  }

  return getColumnMatcher(groupBy);
};

export const buildGetMergeStrategy = (
  groupBy: string | string[] | undefined,
  using?: keyof typeof mergeStrategies | Record<string, keyof typeof mergeStrategies>,
) => {
  const isGroupByField = buildIsGroupByField(groupBy);
  const knownMergeStrategies: Record<string, keyof typeof mergeStrategies> = {};
  const setAndReturnStrategy = (field: string, strategy: keyof typeof mergeStrategies) => {
    knownMergeStrategies[field] = strategy;
    return strategy;
  };

  if (using === undefined) {
    return (field: string) => {
      if (knownMergeStrategies[field]) {
        return knownMergeStrategies[field];
      }

      if (isGroupByField(field)) {
        return setAndReturnStrategy(field, 'group');
      }
      return setAndReturnStrategy(field, 'default');
    };
  }

  if (typeof using === 'string') {
    return (field: string) => {
      if (knownMergeStrategies[field]) {
        return knownMergeStrategies[field];
      }

      if (isGroupByField(field)) {
        return setAndReturnStrategy(field, 'group');
      }
      return setAndReturnStrategy(field, using);
    };
  }

  const anyFieldMergeStrategyName = using['*'];
  return (field: string) => {
    if (knownMergeStrategies[field]) {
      return knownMergeStrategies[field];
    }

    if (isGroupByField(field)) {
      return setAndReturnStrategy(field, 'group');
    }

    const mergeStrategyName = using[field];
    if (mergeStrategyName === undefined) {
      if (anyFieldMergeStrategyName === undefined) {
        return setAndReturnStrategy(field, 'default'); // Use default strategy if none is defined
      }

      return setAndReturnStrategy(field, anyFieldMergeStrategyName);
    }

    return setAndReturnStrategy(field, mergeStrategyName);
  };
};
