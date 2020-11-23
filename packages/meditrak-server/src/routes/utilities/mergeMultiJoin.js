/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export function mergeMultiJoin(baseMultiJoin, multiJoinToMerge) {
  if (!multiJoinToMerge) {
    return baseMultiJoin;
  }
  const checkJoinIsUnique = join => !baseMultiJoin.find(j => j.joinWith === join.joinWith);
  return [...baseMultiJoin].concat(...multiJoinToMerge.filter(checkJoinIsUnique));
}
