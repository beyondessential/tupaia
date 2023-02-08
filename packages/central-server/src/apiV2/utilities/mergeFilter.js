/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export function mergeFilter(baseFilter, filterToMerge) {
  if (!filterToMerge) {
    return baseFilter;
  }

  // Filters may be either arrays or objects depending on whether the query has been built
  const baseComparisonValues = Array.isArray(baseFilter) ? baseFilter : baseFilter.comparisonValue;
  const mergeComparisonValues = getMergeComparisonValues(filterToMerge);

  return baseComparisonValues.filter(i => mergeComparisonValues.includes(i));
}

const getMergeComparisonValues = filterToMerge => {
  switch (typeof filterToMerge) {
    case 'array':
      return filterToMerge;
    case 'object':
      return filterToMerge.comparisonValue;
    case 'string':
      return [filterToMerge];
    default:
      return filterToMerge;
  }
};
