/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import flatten from 'lodash.flatten';
import { stripFromString } from '@tupaia/utils';

/**
 * @returns {
 *  dataElement: { dataElement, categoryId }
 * }
 */
export const buildBaseRowsForOrgUnit = (rows, parent, baseCellIndex, config) => {
  const { stripFromDataElementNames, cells } = config;
  const flatCells = flatten(cells);
  let currentCellIndex = baseCellIndex;
  return rows.reduce((baseRows, row) => {
    if (typeof row === 'string') {
      const dataElement = stripFromString(row, stripFromDataElementNames);
      const dataCode = flatCells[currentCellIndex];
      currentCellIndex++;
      return [...baseRows, { dataCode, dataElement, categoryId: parent }];
    }

    const next = buildBaseRowsForOrgUnit(row.rows, row.category, currentCellIndex, config);
    currentCellIndex += next.length;
    return [...baseRows, ...next];
  }, []);
};
