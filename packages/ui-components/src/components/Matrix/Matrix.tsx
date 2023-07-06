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
import { ACTION_TYPES, MatrixContext, MatrixDispatchContext, matrixReducer } from './MatrixContext';
import { MatrixNavButtons } from './MatrixNavButtons';
import { MatrixRow } from './MatrixRow';
import { EnlargedMatrixCell } from './EnlargedMatrixCell';

const MatrixTable = styled.table`
  border-collapse: collapse;
  border: 1px solid ${({ theme }) => hexToRgba(theme.palette.text.primary, 0.2)};
  color: ${({ theme }) => theme.palette.text.primary};
  height: 1px; // this is to make the cell content (eg. buttons) take full height of the cell, and does not actually get applied
  td,
  th {
    border: 1px solid ${({ theme }) => hexToRgba(theme.palette.text.primary, 0.2)};
  }
`;

// this is a scrollable container
const Wrapper = styled.div`
  max-height: 100%;
  width: 100%;
  overflow: auto;
`;
interface MatrixProps {
  columns: MatrixColumnType[];
  rows: MatrixRowType[];
  presentationOptions: any;
}

export const Matrix = ({ columns = [], rows = [], presentationOptions }: MatrixProps) => {
  const [{ startColumn, expandedRows, maxColumns, enlargedCell }, dispatch] = useReducer(
    matrixReducer,
    {
      startColumn: 0,
      expandedRows: [],
      maxColumns: 0,
      enlargedCell: null,
    },
  );
  const tableEl = useRef<HTMLTableElement | null>(null);

  useEffect(() => {
    // Update the number of columns per page when the table is mounted and data comes in, so that we can determine when to show the nav buttons
    const updateMaxColumns = () => {
      if (!tableEl || !tableEl?.current || !tableEl?.current?.offsetWidth) return;
      const { offsetWidth } = tableEl?.current;
      // 200px is the max width of a column that we want to show
      const maxColumns = Math.floor(offsetWidth / 200);
      dispatch({
        type: ACTION_TYPES.SET_MAX_COLUMNS,
        payload: Math.min(maxColumns, columns.length),
      });
    };

    updateMaxColumns();
  }, [tableEl?.current?.offsetWidth, columns]);

  return (
    <Wrapper>
      <MatrixContext.Provider
        value={{
          presentationOptions,
          columns,
          rows,
          startColumn,
          maxColumns,
          expandedRows,
          enlargedCell,
        }}
      >
        <MatrixDispatchContext.Provider value={dispatch}>
          <MatrixNavButtons />
          <EnlargedMatrixCell />
          <Table component={MatrixTable} ref={tableEl} stickyHeader>
            <MatrixHeaderRow />
            <TableBody>
              {rows.map(row => (
                <MatrixRow row={row} key={row.title} parents={[]} />
              ))}
            </TableBody>
          </Table>
        </MatrixDispatchContext.Provider>
      </MatrixContext.Provider>
    </Wrapper>
  );
};
