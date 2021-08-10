/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import xlsx from 'xlsx';
import { stringToFilename } from '@tupaia/utils';
import { useSortBy, useTable } from 'react-table';
import moment from 'moment';

export const useDataTableExport = (columnsData, data, title) => {
  const { rows, columns } = useTable(
    {
      columns: columnsData,
      data,
    },
    useSortBy,
  );

  const doExport = () => {
    // Get data from react table properties
    const body = rows.map(row => row.values);
    const header = columns.map(col => col.id);

    // Make xlsx worksheet
    // @see https://github.com/SheetJS/sheetjs
    const sheet = xlsx.utils.aoa_to_sheet([[title]]);
    xlsx.utils.sheet_add_json(sheet, body, {
      header,
      origin: 'A3',
    });

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
    const fileName = title
      ? stringToFilename(`export-${title}-${date}.xlsx`)
      : `export-${date}.xlsx`;

    // Write file. This will trigger the file download in the browser
    return xlsx.writeFile(workbook, fileName);
  };

  return { doExport };
};
