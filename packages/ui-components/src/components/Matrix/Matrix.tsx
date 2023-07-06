/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useReducer, useRef } from 'react';
import styled from 'styled-components';
import { Table, TableBody } from '@material-ui/core';
import { MatrixHeaderRow } from './MatrixHeaderRow';
import { MatrixColumnType, MatrixRowType } from '../../types';
import { hexToRgba } from './utils';
import { MatrixContext, MatrixDispatchContext, matrixReducer } from './MatrixContext';
import { MatrixNavButtons } from './MatrixNavButtons';
import { MatrixRow } from './MatrixRow';

const MatrixTable = styled.table`
  overflow: hidden;
  height: 100%; // this is so the modal button for the cell fills the whole height of the cell
  border: 1px solid ${({ theme }) => hexToRgba(theme.palette.text.primary, 0.2)};
  color: ${({ theme }) => theme.palette.text.primary};
  td,
  th {
    border: 1px solid ${({ theme }) => hexToRgba(theme.palette.text.primary, 0.2)};
  }
`;
interface MatrixProps {
  columns: MatrixColumnType[];
  rows: MatrixRowType[];
  presentationOptions: any;
}

export const Matrix = ({ columns = [], rows = [], presentationOptions }: MatrixProps) => {
  const [{ startColumn, expandedRows, maxColumns }, dispatch] = useReducer(matrixReducer, {
    startColumn: 0,
    expandedRows: [],
    maxColumns: 0,
  });
  const tableEl = useRef<HTMLTableElement | null>(null);

  useEffect(() => {
    // Update the number of columns per page when the table is mounted and data comes in, so that we can determine when to show the nav buttons
    const updateMaxColumns = () => {
      if (!tableEl || !tableEl?.current || !tableEl?.current?.offsetWidth) return;
      const { offsetWidth } = tableEl?.current;
      // 200px is the max width of a column that we want to show
      const maxColumns = Math.floor(offsetWidth / 200);
      dispatch({
        type: 'SET_MAX_COLUMNS',
        payload: Math.min(maxColumns, columns.length),
      });
    };

    updateMaxColumns();
  }, [tableEl?.current?.offsetWidth, columns]);

  return (
    <MatrixContext.Provider
      value={{
        presentationOptions,
        columns,
        rows,
        startColumn,
        maxColumns,
        expandedRows,
      }}
    >
      <MatrixDispatchContext.Provider value={dispatch}>
        <MatrixNavButtons />
        <Table component={MatrixTable} ref={tableEl}>
          <MatrixHeaderRow />
          <TableBody>
            {rows.map(row => (
              <MatrixRow row={row} key={row.title} parents={[]} />
            ))}
          </TableBody>
        </Table>
      </MatrixDispatchContext.Provider>
    </MatrixContext.Provider>
  );
};
