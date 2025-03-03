import { toFilename } from '@tupaia/utils';
import { useTable } from 'react-table';
import moment, { Moment } from 'moment';
import { utils, writeFile } from 'xlsx';

export const useDataTableExport = (
  columns: any[],
  data: any[],
  title: string,
  startDate: Moment | string | Date | undefined,
  endDate: Moment | string | Date | undefined,
) => {
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
      headers.map(({ Header, id }) => {
        // If Header is a function, call it to get the header value, otherwise create a function, so that a typescript error about Header possibly not being callable is not thrown
        const getHeader = (typeof Header === 'function' ? Header : () => Header) as Function;
        return getHeader({ column: { id } });
      }),
    );
    const body =
      tableData.length > 0
        ? tableData.map(row =>
            tableColumns.map(col => {
              const value = row.values[col.id];
              // check for strings that are not stringified numbers, including dates and percentages
              if (typeof value === 'string' && Number.isNaN(Number(value))) return value;
              // only parse the value if it is not a boolean (as this means it is definitely meant to be a number)
              const num = value && typeof value !== 'boolean' ? Number(value) : value;

              return num;
            }),
          )
        : [['There is no available data for the selected time period.']];

    // Make xlsx worksheet
    // @see https://github.com/SheetJS/sheetjs
    const sheet = utils.aoa_to_sheet([[title]]);
    sheet['!cols'] = [{ wch: 20 }];

    // add header
    utils.sheet_add_aoa(sheet, header, {
      origin: 'A3',
    });

    // add body
    utils.sheet_add_aoa(sheet, body, { origin: -1 });

    // spacer before footer
    utils.sheet_add_aoa(sheet, [[]], {
      origin: -1,
    });
    utils.sheet_add_aoa(sheet, [[]], {
      origin: -1,
    });

    // footer
    if (startDate && endDate) {
      const formatDate = (dateToFormat: Date | string | Moment) =>
        moment(dateToFormat).format('DD/MM/YY');
      utils.sheet_add_aoa(
        sheet,
        [[`Includes data from ${formatDate(startDate)} to ${formatDate(endDate)}.`]],
        {
          origin: -1,
        },
      );
    }
    utils.sheet_add_aoa(
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
    return writeFile(workbook, `${fileName}.xlsx`);
  };

  return { doExport };
};
