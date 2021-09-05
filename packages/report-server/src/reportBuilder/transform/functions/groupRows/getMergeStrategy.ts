/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { mergeStrategies } from './mergeStrategies';

const buildIsGroupByField = (by: string | string[] | undefined) => {
  if (by === undefined) {
    return () => false;
  }

  if (typeof by === 'string') {
    return (field: string) => field === by;
  }

  return (field: string) => by.includes(field);
};

export const buildGetMergeStrategy = (
  by: string | string[] | undefined,
  mergeUsing: keyof typeof mergeStrategies | Record<string, keyof typeof mergeStrategies>,
) => {
  const isGroupByField = buildIsGroupByField(by);
  if (typeof mergeUsing === 'string') {
    return (field: string) => {
      if (isGroupByField(field)) {
        return 'group';
      }
      return mergeUsing;
    };
  }

  const anyFieldMergeStrategyName = mergeUsing['*'];
  return (field: string) => {
    if (isGroupByField(field)) {
      return 'group';
    }

    const mergeStrategyName = mergeUsing[field];
    if (mergeStrategyName === undefined) {
      if (anyFieldMergeStrategyName === undefined) {
        throw new Error(`No merge strategy defined for column ${field}`);
      }

      return anyFieldMergeStrategyName;
    }

    return mergeStrategyName;
  };
};
