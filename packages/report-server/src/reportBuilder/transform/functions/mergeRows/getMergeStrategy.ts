/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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

  if (using === undefined) {
    return (field: string) => {
      if (isGroupByField(field)) {
        return 'group';
      }
      return 'default';
    };
  }

  if (typeof using === 'string') {
    return (field: string) => {
      if (isGroupByField(field)) {
        return 'group';
      }
      return using;
    };
  }

  const anyFieldMergeStrategyName = using['*'];
  return (field: string) => {
    if (isGroupByField(field)) {
      return 'group';
    }

    const mergeStrategyName = using[field];
    if (mergeStrategyName === undefined) {
      if (anyFieldMergeStrategyName === undefined) {
        return 'default'; // Use default strategy if none is defined
      }

      return anyFieldMergeStrategyName;
    }

    return mergeStrategyName;
  };
};
