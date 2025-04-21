import { stripFromString } from '@tupaia/utils';
import flatten from 'lodash.flatten';

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
      baseRows.push({ dataCode, dataElement, categoryId: parent });
      return baseRows;
    }

    const next = buildBaseRowsForOrgUnit(row.rows, row.category, currentCellIndex, config);
    currentCellIndex += next.length;
    baseRows.push(...next);
    return baseRows;
  }, []);
};
