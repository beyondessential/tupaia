/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import xlsx from 'xlsx';
import { toFilename } from '@tupaia/utils';
import { useTable } from 'react-table';
import moment from 'moment';

export const useDataTableExport = (columns, data, title) => {
  const { headerGroups, rows: tableData, columns: tableColumns } = useTable({
    columns,
    data,
  });

  const doExport = () => {
    // Get data from react table properties
    const header = headerGroups.map(({ headers }) =>
      headers.map(({ Header: getHeader, id }) =>
        typeof getHeader === 'function' ? getHeader({ column: { id } }) : getHeader,
      ),
    );
    const body =
      tableData.length > 0
        ? tableData.map(row => tableColumns.map(col => row.values[col.id]))
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

    const date = moment().format('Do MMM YY');
    xlsx.utils.sheet_add_aoa(
      sheet,
      [[], [], [`Exported on ${date} from ${window.location.hostname}`]],
      {
        origin: -1,
      },
    );

    // Make  xlsx workbook
    const sheetName = `Export on ${date}`;
    const workbook = { SheetNames: [sheetName], Sheets: { [sheetName]: sheet } };

    // Make filename
    const fileName = title ? toFilename(`export-${title}-${date}`) : `export-${date}`;

    // Write file. This will trigger the file download in the browser
    return xlsx.writeFile(workbook, `${fileName}.xlsx`);
  };

  return { doExport };
};
