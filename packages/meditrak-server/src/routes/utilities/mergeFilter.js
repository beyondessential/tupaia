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
  const mergeComparisonValues = Array.isArray(filterToMerge)
    ? filterToMerge
    : filterToMerge.comparisonValue;

  return baseComparisonValues.filter(i => mergeComparisonValues.includes(i));
}
