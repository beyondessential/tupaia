import { getSortByKey } from '@tupaia/utils';

/* Join multiple table data into single table joining on mergeCompareValue
 * We rely on the data being sorted by mergeCompareValue
 *
 * tableData is expected to be of format:
 *
 *  tableData = {
 *    sheet1: {
 *      data: {
 *        cols: [ { key: event,
                    title: event,
                    mergeCompareValue: string,
                  }, 
                  ...
                ],
 *        rows: [ { key: value }, 
                    ...
                ],
 *        skipHeader: boolean, (optional)
 *      }
 *     },
 *    sheet2: {
 *      data: {
 *        cols: [...],
 *        rows: [...],
 *        skipHeader: boolean, (optional)
 *      }
 *     },
 *    ...
 *   };
 *
 *  */
export const mergeTableDataOnKey = (tableData, name) => {
  const mergedTableData = { data: { columns: [], rows: [] } };
  const compareByMergeValue = getSortByKey('mergeCompareValue');

  Object.keys(tableData).forEach(table => {
    mergedTableData.data = mergeInData(
      mergedTableData.data,
      tableData[table].data,
      compareByMergeValue,
    );
  });

  return { [name]: mergedTableData };
};

const mergeInData = (currentData, newData, comparator) => {
  if (!newData) return currentData;

  const mergedData = {};
  mergedData.rows = currentData.rows.concat(newData.rows);

  const mergedColumns = [];

  const compareColumns = (currentCols, newCols) => {
    // Assume out of loop if both lengths = 0;
    if (newCols.length < 1) return -1;
    if (currentCols.length < 1) return 1;
    return comparator(currentCols[0], newCols[0]);
  };

  const getMergeKey = (currentKey, newKey) => `${currentKey}-${newKey}`;

  const zipColumns = (currentCol, newCol) => {
    // Loop through rows and switch keys
    const mergedCol = {};
    mergedCol.key = getMergeKey(currentCol.key, newCol.key);
    mergedCol.title = getMergeKey(currentCol.key, newCol.key);
    mergedCol.mergeCompareValue = currentCol.mergeCompareValue;
    return mergedCol;
  };

  // We are assuming keys are unique across columns
  // true for events. Be Warned in other cases!
  const mergeRowKeys = (row, currentKey, newKey) => {
    const alteredRow = { ...row };
    const mergedKey = getMergeKey(currentKey, newKey);
    if (row.hasOwnProperty(currentKey)) {
      alteredRow[mergedKey] = row[currentKey];
      delete alteredRow[currentKey];
    }
    if (row.hasOwnProperty(newKey)) {
      alteredRow[mergedKey] = row[newKey];
      delete alteredRow[newKey];
    }
    return alteredRow;
  };

  const currentColumns = currentData.columns;
  const newColumns = newData.columns.sort(comparator);

  // assume both columns are sorted by mergeCompareValue
  // compare each head column.mergeCompareValue
  // shift the lesser head or combine if equal
  while (currentColumns.length + newColumns.length > 0) {
    const compareState = compareColumns(currentColumns, newColumns);

    if (compareState === 0) {
      mergedData.rows = mergedData.rows.map(r => {
        return mergeRowKeys(r, currentColumns[0].key, newColumns[0].key);
      });
      mergedColumns.push(zipColumns(currentColumns.shift(), newColumns.shift()));
    }

    if (compareState > 0) {
      mergedColumns.push(newColumns.shift());
    }

    if (compareState < 0) {
      mergedColumns.push(currentColumns.shift());
    }
  }

  mergedData.columns = mergedColumns;

  return mergedData;
};
