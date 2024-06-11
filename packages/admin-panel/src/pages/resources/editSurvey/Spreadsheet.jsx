/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import xlsx from 'xlsx';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer as MuiTableContainer,
  TableHead as MuiTableHead,
  TableRow,
} from '@material-ui/core';
import { useFlexLayout, useResizeColumns, useTable } from 'react-table';
import { useApiContext } from '../../../utilities/ApiProvider';

const Cell = styled(TableCell)`
  padding-inline: 0.2rem;
  padding-block: 0.4rem;
  border-color: ${({ theme }) => theme.palette.grey['400']};
  border-style: solid;
  border-width: 0 1px 1px 0;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  // TODO: fix this once we apply resizable columns
  max-width: 200px;
`;

const HeaderCell = styled(Cell).attrs({
  component: 'th',
})`
  background-color: ${({ theme }) => theme.palette.grey['400']};
  border-color: white;
  border-style: solid;
`;

const ColumnHeaderCell = styled(HeaderCell)`
  border-width: 0 1px 1px 0;
`;

const RowHeaderCell = styled(HeaderCell)`
  left: 0;
  position: sticky !important; // to override the position that is applied inline by react-table
  z-index: 2;
  thead & {
    top: 0;
    z-index: 4;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const TableContainer = styled(MuiTableContainer)`
  flex: 1;
  overflow: auto;
`;

// workaround for sticky header not working with flex layout, which is needed for resizable columns
const TableHead = styled(MuiTableHead)`
  position: sticky;
  top: 0;
  z-index: 3;
`;

const useInitialFile = (surveyId, isOpen, uploadedFile = null) => {
  const [file, setFile] = useState(uploadedFile);

  const [error, setError] = useState(null);
  const api = useApiContext();
  const getInitialFile = async () => {
    try {
      const blob = await api.download(`export/surveys/${surveyId}`, {}, null, true);
      const arrayBuffer = await blob.arrayBuffer();

      setFile(arrayBuffer);
    } catch (e) {
      setError(e);
    }
  };

  useEffect(() => {
    if (file || !isOpen) return;
    if (uploadedFile) {
      setFile(uploadedFile);
    } else getInitialFile();
  }, [isOpen]);

  return { file, error };
};

const useSpreadsheetJson = file => {
  const [json, setJson] = useState(null);

  useEffect(() => {
    if (!file || json) return;
    const wb = xlsx.read(file, { type: 'array' });
    const sheetJson = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    setJson(sheetJson);
  }, [file]);

  return json;
};

export const Spreadsheet = ({ survey, open, currentFile }) => {
  const { file } = useInitialFile(survey?.id, open, currentFile);
  const json = useSpreadsheetJson(file);

  const columns = useMemo(
    () =>
      json
        ? [
            {
              Header: '',
              accessor: 'index',
              canResize: false,
              width: 60,
              maxWidth: 60,
            },
            ...Object.keys(json[0]).map(key => ({ Header: key, accessor: key, canResize: true })),
          ]
        : [],
    [json],
  );

  const data = useMemo(() => {
    if (!json) return [];
    return json.map((row, index) => ({ ...row, index: index + 1 }));
  }, [json]);

  const { headerGroups, rows, prepareRow, getTableProps, getTableBodyProps } = useTable(
    {
      columns,
      data,
    },
    useFlexLayout,
    useResizeColumns,
  );
  return (
    <Wrapper>
      <TableContainer>
        <Table stickyHeader size="small" {...getTableProps()}>
          <TableHead>
            {headerGroups.map(headerGroup => (
              <TableRow key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, i) => (
                  <ColumnHeaderCell
                    key={column.id}
                    {...column.getHeaderProps()}
                    as={i === 0 ? RowHeaderCell : undefined}
                  >
                    {column.render('Header')}
                  </ColumnHeaderCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <TableRow key={row.id} {...row.getRowProps()}>
                  {row.cells.map((cell, i) => (
                    <Cell
                      key={cell.id}
                      {...cell.getCellProps()}
                      as={i === 0 ? RowHeaderCell : undefined}
                    >
                      {cell.render('Cell')}
                    </Cell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Wrapper>
  );
};

Spreadsheet.propTypes = {
  open: PropTypes.bool.isRequired,
  survey: PropTypes.object.isRequired,
  currentFile: PropTypes.object,
};

Spreadsheet.defaultProps = {
  currentFile: null,
};
