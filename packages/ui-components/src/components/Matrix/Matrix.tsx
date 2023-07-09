/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useReducer, useRef } from 'react';
import styled from 'styled-components';
import { Table, TableBody } from '@material-ui/core';
import { PresentationOptions } from '@tupaia/types';
import { MatrixColumnType, MatrixRowType } from '../../types';
import { getFlattenedColumns } from './utils';
import { MatrixHeader } from './MatrixHeader';
import { ACTION_TYPES, MatrixContext, MatrixDispatchContext, matrixReducer } from './MatrixContext';
import { MatrixNavButtons } from './MatrixNavButtons';
import { MatrixRow } from './MatrixRow';
import { EnlargedMatrixCell } from './EnlargedMatrixCell';
import { MatrixLegend } from './MatrixLegend';

const MatrixTable = styled.table`
  border-collapse: collapse;
  color: ${({ theme }) => theme.palette.text.primary};
  height: 1px; // this is to make the cell content (eg. buttons) take full height of the cell, and does not actually get applied
  table-layout: fixed;
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
  presentationOptions?: PresentationOptions;
  categoryPresentationOptions?: PresentationOptions;
}

export const Matrix = ({
  columns = [],
  rows = [],
  presentationOptions,
  categoryPresentationOptions,
}: MatrixProps) => {
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
      const maxColumns = Math.floor(usableWidth / 200);

      const flattenedColumns = getFlattenedColumns(columns);
      dispatch({
        type: ACTION_TYPES.SET_MAX_COLUMNS,
        payload: Math.min(maxColumns, flattenedColumns.length),
      });
    };

    updateMaxColumns();
  }, [tableEl?.current?.offsetWidth, columns]);
  return (
    <Wrapper>
      <MatrixContext.Provider
        value={{
          presentationOptions,
          categoryPresentationOptions,
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
            <MatrixHeader />
            <TableBody>
              {rows.map(row => (
                <MatrixRow row={row} key={row.title} parents={[]} />
              ))}
            </TableBody>
          </Table>
          <MatrixLegend />
        </MatrixDispatchContext.Provider>
      </MatrixContext.Provider>
    </Wrapper>
  );
};
