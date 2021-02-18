/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Builder } from './Builder';
import { AggregationList } from './types';

type AggregationListsMap = Record<string, AggregationList[]>;

/**
 * Merge aggregation list maps from `newEntries` in `targetMap`
 */
const addEntriesInAggregationListMap = (
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

const getAggregationListMapsByBuilder = (builders: Builder[]) =>
  Object.fromEntries(
    builders.map(builder => [builder.getIndicator().code, builder.getAggregationListsByElement()]),
  );

export const getAggregationListsForAnalyticsFetch = (buildersByNestDepth: Builder[][]) => {
  let aggregationListMap: AggregationListsMap = {};

  buildersByNestDepth.forEach(builders => {
    const listMapsByBuilder = getAggregationListMapsByBuilder(builders);
    aggregationListMap = addEntriesInAggregationListMap(aggregationListMap, listMapsByBuilder);
  });

  return Object.values(aggregationListMap).flat();
};
