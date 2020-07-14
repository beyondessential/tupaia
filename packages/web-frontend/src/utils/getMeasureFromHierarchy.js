/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Find a measure by measure id from within a hierarchy.
 */

export const getMeasureFromHierarchy = (measureHierarchy, measureId) => {
  if (!measureId || !measureHierarchy) {
    return null;
  }

  const hierarchyCategories = Object.values(measureHierarchy);
  if (!hierarchyCategories) {
    return null;
  }

  for (let i = 0; i < hierarchyCategories.length; i++) {
    const measureOptions = hierarchyCategories[i];
    const result = getNestedHierarchyMeasure(measureOptions, measureId);

    if (result) {
      return result;
    }
  }

  return null;
};

const getNestedHierarchyMeasure = (measureOptions, measureId) => {
  for (let m = 0; m < measureOptions.length; m++) {
    if (measureOptions[m] && measureOptions[m].type === 'mapOverlayGroup') {
      const result = getNestedHierarchyMeasure(measureOptions[m].children, measureId);
      if (result) {
        return result;
      }
    } else if (measureOptions[m] && measureOptions[m].measureId === measureId) {
      return measureOptions[m];
    }
  }

  return null;
};
