const DEFAULT_CONFIG = {
  dataElementHeader: 'Data Element',
};

// Takes in the data for a matrix type view and converts it into json representing an Excel
// spreadsheet in the format required by the xlsx library, i.e. an array of objects, with each
// object in the array representing a row in the spreadsheet, and each key value pair in that object
// representing a column (with the key as the column header), e.g.
// [
//  { 'Column A': 'This is cell A1', 'Favourite Fruit': 'Oranges' },
//  { 'Column B': 'This is cell B1', 'Favourite Fruit': 'Apples' },
// ]
// See https://docs.sheetjs.com/#array-of-objects-input for more

export const formatMatrixDataForExcel = (
  { columns, categories: rowCategories, rows },
  configIn,
) => {
  // Create the empty array of objects to build the data into
  const formattedData = [];
  const columnCategories = columns[0].columns && columns; // If columns are grouped into categories, store as a well named const
  const config = { ...DEFAULT_CONFIG, ...configIn };

  // Set up function to process each row
  const addRowToFormattedData = row => {
    const rowData = { [config.dataElementHeader]: row.dataElement };
    if (columnCategories) {
      // This table has categories, iterate through the column categories
      columnCategories.forEach(({ category: columnCategoryTitle, columns: columnsInCategory }) => {
        // Add an empty column to start each category, with just the header filled as the title of the category
        rowData[columnCategoryTitle] = '';
        // Iterate through each of the columns in the category, and add the relevant row data
        columnsInCategory.forEach(({ key: columnKey, title: columnTitle }) => {
          rowData[columnTitle] = row[columnKey] || '';
        });
      });
    } else {
      // This table has no column categories, just one set of columns
      columns.forEach(({ key: columnKey, title: columnTitle }) => {
        rowData[columnTitle] = isEmpty(row[columnKey]) ? '' : row[columnKey];
      });
    }
    formattedData.push(rowData);
  };

  // Iterate through all rows and add them
  if (rowCategories) {
    // Add rows a category at a time, so all rows from the same category are grouped
    rowCategories.forEach(({ key: rowCategoryKey, title: rowCategoryTitle }) => {
      // Insert a separating empty row between categories
      formattedData.push({ [config.dataElementHeader]: rowCategoryTitle });
      // Add the data from all rows in this category
      rows.filter(({ categoryId }) => rowCategoryKey === categoryId).forEach(addRowToFormattedData);
    });
  } else {
    // This table has no row categories, just one set of rows
    rows.forEach(addRowToFormattedData);
  }
  return formattedData;
};

// Takes in the data for a matrix type view and converts it into an array of arrays representing
// an Excel spreadsheet in the format required by the xlsx library, i.e. an array of arrays,
// with each child array in the array representing a row in the spreadsheet,
// with a array[0] representing the column headers, e.g.
// [
//  [ 'Column Title A', 'Column Title B', ... ],
//  [ 'Cell A1', 'Cell B1', ... },
//  [ 'Cell A2', 'Cell B2', ... },
//  ...,
// ]
// See https://docs.sheetjs.com/#array-of-arrays-input for more

export const formatMatrixDataForExcelAoA = (
  { columns, categories: rowCategories, rows },
  configIn,
) => {
  // Create the empty array of objects to build the data into
  const formattedData = [];
  const columnCategories = columns[0].columns && columns; // If columns are grouped into categories, store as a well named const
  const config = { ...DEFAULT_CONFIG, ...configIn };

  // Returns populated array instead of object
  const formatRowData = row => {
    const rowData = columnCategories
      ? // This table has categories, iterate through the column categories
        columnCategories.map(({ columns: columnsInCategory }) => {
          // Add an empty column to start each category, with just the header filled as the title of the category
          // Iterate through each of the columns in the category, and add the relevant row data
          return ['', ...columnsInCategory.map(col => addValueOrEmpty(row[col.key]))];
        })
      : // This table has no column categories, just one set of columns
        columns.map(col => addValueOrEmpty(row[col.key]));

    //prepend dataElementHeader
    rowData.unshift(row.dataElement);

    return rowData;
  };

  const buildTitleRow = () => {
    const titleRowData = columnCategories
      ? // This table has categories, iterate through the column categories add category title
        // and iterate through each of the columns in the category, and add the relevant title
        columnCategories.map(({ category: columnCategoryTitle, columns: columnsInCategory }) => {
          return [columnCategoryTitle, ...columnsInCategory.map(col => col.title)];
        })
      : columns.map(col => col.title);

    // prepend dataElementHeader
    titleRowData.unshift(config.dataElementHeader);

    return titleRowData;
  };

  // add to title row 'top' of sheet
  const titleRow = buildTitleRow();
  formattedData.push(titleRow);

  // Iterate through all rows and add them
  if (rowCategories) {
    // Add rows a category at a time, so all rows from the same category are grouped
    rowCategories.forEach(({ key: rowCategoryKey, title: rowCategoryTitle }) => {
      // Insert a separating empty row between categories
      formattedData.push([rowCategoryTitle].fill('', 1, titleRow.length - 1));
      // Add the data from all rows in this category
      const formattedRowData = rows
        .filter(({ categoryId }) => rowCategoryKey === categoryId)
        .map(formatRowData);
      formattedData.push(...formattedRowData);
    });
  } else {
    // This table has no row categories, just one set of rows
    formattedData.push(...rows.map(formatRowData));
  }
  return formattedData;
};

const isEmpty = data => data === undefined || data === null;

const addValueOrEmpty = value => (isEmpty(value) ? '' : value);
