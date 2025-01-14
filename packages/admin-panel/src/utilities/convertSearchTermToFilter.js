export const convertSearchTermToFilter = (unprocessedFilterObject = {}) => {
  const filterObject = {};
  Object.entries(unprocessedFilterObject).forEach(([key, value]) => {
    if (typeof value !== 'string') {
      filterObject[key] = value;
      return;
    }

    filterObject[key] = {
      comparator: `ilike`,
      // When user accidentally press space, it will still search
      comparisonValue: `${value.trim()}%`,
      castAs: 'text',
    };
  });
  return filterObject;
};
