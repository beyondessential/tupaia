/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import xlsx from 'xlsx';
import { displayStringToMoment, toFilename } from '@tupaia/utils';
import { useTable } from 'react-table';
import moment from 'moment';

export const useDataTableExport = (columns, data, title, startDate, endDate) => {
  const {
    headerGroups,
    rows: tableData,
    columns: tableColumns,
  } = useTable({
    columns,
    data,
  });

  const doExport = () => {
    const date = moment().format('Do MMM YY');

    // Get data from react table properties
    const header = headerGroups.map(({ headers }) =>
      headers.map(({ Header: getHeader, id }) =>
        typeof getHeader === 'function' ? getHeader({ column: { id } }) : getHeader,
      ),
    );
    const body =
      tableData.length > 0
        ? tableData.map(row =>
            tableColumns.map(col => {
              const value = row.values[col.id];

              // Attempt to convert to a moment object if is a string that can't be converted to a number (isNaN). If it's a date string, return in date format, otherwise continue
              // This check will handle percentage strings as well as date strings, and any other non-numeric strings
              if (typeof value === 'string' && isNaN(value)) {
                const momentObj = displayStringToMoment(value);
                if (momentObj.isValid()) {
                  // check the format of the date string. If it includes 'D' it means it is a day date, so we want to reformat these as 'DD/MM/YYYY'. Everything else should be returned as they are
                  const { _f: format } = momentObj;
                  if (format && format.includes('D')) return momentObj.format('DD/MM/YYYY');
                }
                return value;
              }

              // Parse the value as a float, and if it's a number then return as a number, otherwise return the value as is. This handles cases like booleans, because isNaN(boolean) === false, but isNaN(parseFloat(boolean)) === true
              const num = parseFloat(value);
              return isNaN(num) ? value : num;
            }),
          )
        : [['There is no available data for the selected time period.']];

    // Make xlsx worksheet
    // @see https://github.com/SheetJS/sheetjs
    const sheet = xlsx.utils.aoa_to_sheet([[title]]);
    sheet['!cols'] = [{ wch: 20 }];

    // add header
    xlsx.utils.sheet_add_aoa(sheet, header, {
      origin: 'A3',
    });

    // add body
    xlsx.utils.sheet_add_aoa(sheet, body, { origin: -1 });

    // spacer before footer
    xlsx.utils.sheet_add_aoa(sheet, [[]], {
      origin: -1,
    });
    xlsx.utils.sheet_add_aoa(sheet, [[]], {
      origin: -1,
    });

    // footer
    if (startDate && endDate) {
      const formatDate = date => moment(date).format('DD/MM/YY');
      xlsx.utils.sheet_add_aoa(
        sheet,
        [[`Includes data from ${formatDate(startDate)} to ${formatDate(endDate)}.`]],
        {
          origin: -1,
        },
      );
    }
    xlsx.utils.sheet_add_aoa(
      sheet,
      [[`Exported on ${String(moment())} from ${window.location.hostname}`]],
      {
        origin: -1,
      },
    );

    // Make  xlsx workbook
    const sheetName = `Export on ${date}`;
    const workbook = { SheetNames: [sheetName], Sheets: { [sheetName]: sheet } };

    // Make filename
    const fileName = title ? toFilename(`export-${title}-${date}`, true) : `export-${date}`;

    // Write file. This will trigger the file download in the browser
    return xlsx.writeFile(workbook, `${fileName}.xlsx`);
  };

  return { doExport };
};
