/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { AggregationListsMap } from './types';

/**
 * Merge aggregation list maps from `listMapEntries` in `targetMap`
 */
export const addEntriesInAggregationListMap = (
  targetMap: AggregationListsMap,
  newEntries: Record<string, AggregationListsMap>,
): AggregationListsMap => {
  const newMap = { ...targetMap };

  const addEntry = ([entryCode, map]: [string, AggregationListsMap]) => {
    const existingListsForEntry = newMap[entryCode];

    Object.entries(map).forEach(([dataElement, elementLists]) => {
      const listsToInsert = existingListsForEntry
        ? // If there are existing lists for the current `entryCode`, we want to
          // combine them with the new `elementLists`
          existingListsForEntry
            // Existing entry list was pushed before the new element list, so keep it in the start
            .map(entryList => elementLists.map(elementList => [...entryList, ...elementList]))
            .flat()
        : elementLists;

      newMap[dataElement] = [...(newMap[dataElement] || []), ...listsToInsert];
    });

    // Delete `entryCode` (if it exists), since its aggregations
    // will have been replaced with its nested data elements above
    delete newMap[entryCode];
  };

  Object.entries(newEntries).forEach(addEntry);
  return newMap;
};
