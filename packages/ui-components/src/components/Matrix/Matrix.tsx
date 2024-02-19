/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode, useEffect, useReducer, useRef } from 'react';
import styled from 'styled-components';
import { Table, TableBody } from '@material-ui/core';
import { MatrixConfig } from '@tupaia/types';
import { MatrixColumnType, MatrixRowType } from '../../types';
import { getFlattenedColumns, getFullHex } from './utils';
import { MatrixHeader } from './MatrixHeader';
import { ACTION_TYPES, MatrixContext, MatrixDispatchContext, matrixReducer } from './MatrixContext';
import { MatrixNavButtons } from './MatrixNavButtons';
import { MatrixRow } from './MatrixRow';
import { EnlargedMatrixCell } from './EnlargedMatrixCell';
import { MatrixLegend } from './MatrixLegend';

const MatrixTable = styled.table`
  border: 1px solid ${({ theme }) => getFullHex(theme.palette.text.primary)}33;
  color: ${({ theme }) => theme.palette.text.primary};
  table-layout: fixed; // this is to allow us to set max-widths on the columns
  height: 1px; // this is to make the cell content (eg. buttons) take full height of the cell, and does not actually get applied
`;

const ScrollContainer = styled.div`
  max-height: inherit;
  overflow-y: auto;
  flex: 1;
`;

interface MatrixProps extends Omit<MatrixConfig, 'type' | 'name'> {
  columns: MatrixColumnType[];
  rows: MatrixRowType[];
  disableExpand?: boolean;
  rowHeaderColumnTitle?: ReactNode;
}

export const Matrix = ({ columns = [], rows = [], disableExpand, ...config }: MatrixProps) => {
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
      const usableWidth = offsetWidth - 200; // the max size of the first column (row title)
      const updatedMaxCols = Math.floor(usableWidth / 200) || 1;

      const flattenedColumns = getFlattenedColumns(columns);
      dispatch({
        type: ACTION_TYPES.SET_MAX_COLUMNS,
        payload: Math.min(updatedMaxCols, flattenedColumns.length),
      });
    };

    updateMaxColumns();
  }, [tableEl?.current?.offsetWidth, columns]);

  return (
    <MatrixContext.Provider
      value={{
        ...config,
        columns,
        rows,
        startColumn,
        maxColumns,
        expandedRows,
        enlargedCell,
        disableExpand,
      }}
    >
      <MatrixDispatchContext.Provider value={dispatch}>
        <MatrixNavButtons />
        <EnlargedMatrixCell />
        <ScrollContainer>
          <Table component={MatrixTable} ref={tableEl} stickyHeader>
            <MatrixHeader />
            <TableBody>
              {rows.map(row => (
                // add a random key to avoid bugs with re-rendering
                <MatrixRow row={row} key={`${row.title}_${Math.random() * 1000}`} parents={[]} />
              ))}
            </TableBody>
          </Table>
        </ScrollContainer>
        <MatrixLegend />
      </MatrixDispatchContext.Provider>
    </MatrixContext.Provider>
  );
};
