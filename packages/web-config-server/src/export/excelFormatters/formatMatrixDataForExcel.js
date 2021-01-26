import moment from 'moment';
import {addExportedDateAndOriginAtTheSheetBottom } from '@tupaia/utils';

const DEFAULT_CONFIG = {
  dataElementHeader: 'Data Element',
};

// Takes in the data for a matrix type view and converts it into an array of arrays representing
// an Excel spreadsheet in the format required by the xlsx library, i.e. an array of arrays,
// with each child array in the array representing a row in the spreadsheet,
// with a array[0] representing the column headers, e.g.
// [
//  [ 'Column Title A', 'Column Title B', ... ],
//  [ 'Cell A2', 'Cell B2', ... ],
//  [ 'Cell A3', 'Cell B3', ... ],
//  ...,
// ]
// See https://docs.sheetjs.com/#array-of-arrays-input for more
//
// For array of object format specify outputFormat='aoo'. Default: 'aoa' (array of arrays)
// [
//  { 'Column Title A': 'Cell A2', 'Column Title B': 'Cell B2' },
//  { 'Column Title A': 'Cell A3', 'Column Title B': 'Cell B3' },
// ]
// See https://docs.sheetjs.com/#array-of-objects-input for more
export const formatMatrixDataForExcel = (
  { columns, categories: rowCategories, rows, name: reportName, organisationUnitCode },
  timeZone,
  configIn,
  outputFormat = 'aoa'
) => {
  // Create the empty array of objects to build the data into
  let formattedData = [];
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

    // prepend dataElementHeader
    rowData.unshift(row.dataElement);

    return rowData;
  };

  const buildHeadersRow = () => {
    const headersRowData = columnCategories
      ? // This table has categories, iterate through the column categories add category title
        // and iterate through each of the columns in the category, and add the relevant title
        columnCategories.map(({ category: columnCategoryTitle, columns: columnsInCategory }) => {
          return [columnCategoryTitle, ...columnsInCategory.map(col => col.title)];
        })
      : columns.map(col => col.title);

    // prepend dataElementHeader
    headersRowData.unshift(config.dataElementHeader);

    return headersRowData;
  };

  // Add title row (report name) to the top of the sheet
  formattedData.push([`${reportName}, ${organisationUnitCode}`]);

  // Add headers row to the second top of the sheet
  const headersRow = buildHeadersRow();
  formattedData.push(headersRow);

  // Iterate through all rows and add them
  if (rowCategories) {
    // Add rows a category at a time, so all rows from the same category are grouped
    rowCategories.forEach(({ key: rowCategoryKey, title: rowCategoryTitle }) => {
      // Insert a separating empty row between categories
      formattedData.push([rowCategoryTitle].fill('', 1, headersRow.length - 1));
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

  // Add export date and origin to the bottom of the sheet
  formattedData = addExportedDateAndOriginAtTheSheetBottom(formattedData, timeZone);

  return outputFormat === 'aoo' ? convertAoaToAoo(formattedData) : formattedData;
};

// Convert Array of arrays data format to array of objects (json) data format
// Input:
// [
//  [ 'Column Title A', 'Column Title B', ... ],
//  [ 'Cell A2', 'Cell B2', ... ],
//  [ 'Cell A3', 'Cell B3', ... ],
//  ...,
// ]
// Output:
// [
//  { 'Column Title A': 'Cell A2', 'Column Title B': 'Cell B2' },
//  { 'Column Title A': 'Cell A3', 'Column Title B': 'Cell B3' },
// ]
const convertAoaToAoo = data => {
  if (data.length < 1) return data;

  const headers = data.shift();
  return data.map(row => {
    const rowObject = {};
    row.forEach((column, index) => {
      rowObject[headers[index]] = column;
    });
    return rowObject;
  });
};

const isEmpty = data => data === undefined || data === null;

const addValueOrEmpty = value => {
  if (isEmpty(value)) return '';

  if (typeof value === 'object') {
    return isEmpty(value.value) ? '' : value.value;
  }

  return value;
}
