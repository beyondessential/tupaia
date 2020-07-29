/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Find a measure by measure id from within a hierarchy.
 */

export const getMeasureFromHierarchy = (measureHierarchies, measureId) => {
  if (!measureId || !measureHierarchies) {
    return null;
  }

  for (let i = 0; i < measureHierarchies.length; i++) {
    const measureOptions = measureHierarchies[i];

    if (measureOptions.children) {
      const result = getMeasureFromHierarchy(measureOptions.children, measureId);

      if (result) {
        return result;
      }
    } else if (measureOptions.measureId === measureId) {
      return measureOptions;
    }
  }

  return null;
};
