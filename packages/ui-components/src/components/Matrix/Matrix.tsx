/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode, useReducer, useRef } from 'react';
import styled from 'styled-components';
import { Table, TableBody, TableContainer } from '@material-ui/core';
import { MatrixConfig } from '@tupaia/types';
import { MatrixColumnType, MatrixRowType } from '../../types';
import { MatrixHeader } from './MatrixHeader';
import { MatrixContext, MatrixDispatchContext, matrixReducer } from './MatrixContext';
import { MatrixRow } from './MatrixRow';
import { MatrixLegend } from './MatrixLegend';

const MatrixTable = styled.table`
  color: ${({ theme }) => theme.palette.text.primary};
  height: 1px; // this is to make the cell content (eg. buttons) take full height of the cell, and does not actually get applied
  border-collapse: collapse; // necessary to enable borders between column groups
`;

// wraps the table in a container so that we can set a max-height on it and make it scrollable inside it
const ScrollContainer = styled(TableContainer)`
  max-height: clamp(
    20rem,
    70vh,
    60rem
  ); // We already tell users the matrix can't be viewed properly on small screens, but we set some sensible limits just in case
`;

interface MatrixProps extends Omit<MatrixConfig, 'type' | 'name'> {
  columns: MatrixColumnType[];
  rows: MatrixRowType[];
  disableExpand?: boolean;
  rowHeaderColumnTitle?: ReactNode;
}

export const Matrix = ({ columns = [], rows = [], disableExpand, ...config }: MatrixProps) => {
  const [{ expandedRows }, dispatch] = useReducer(matrixReducer, {
    expandedRows: [],
  });
  const tableEl = useRef<HTMLTableElement | null>(null);

  return (
    <MatrixContext.Provider
      value={{
        ...config,
        columns,
        rows,
        expandedRows,
        disableExpand,
      }}
    >
      <MatrixDispatchContext.Provider value={dispatch}>
        <MatrixLegend />
        <ScrollContainer>
          <Table component={MatrixTable} ref={tableEl} stickyHeader>
            <MatrixHeader />
            <TableBody>
              {rows.map((row, i) => (
                <MatrixRow row={row} key={`${row.title}-${i}`} parents={[]} index={i + 1} />
              ))}
            </TableBody>
          </Table>
        </ScrollContainer>
      </MatrixDispatchContext.Provider>
    </MatrixContext.Provider>
  );
};
