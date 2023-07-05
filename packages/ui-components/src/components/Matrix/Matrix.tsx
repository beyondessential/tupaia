/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useReducer, useRef, useState } from 'react';
import styled from 'styled-components';
import { Table } from '@material-ui/core';
import { MatrixHeaderRow } from './MatrixHeaderRow';
import { MatrixColumnType, MatrixRowType } from '../../types';
import { hexToRgba } from './utils';
import {
  MatrixContext,
  MatrixStartColumnDispatchContext,
  matrixStartColumnReducer,
} from './MatrixContext';
import { MatrixBody } from './MatrixBody';
import { MatrixNavButtons } from './MatrixNavButtons';

export const MINIMUM_CELL_WIDTH = 55;

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
  onUpdateSearch?: (search: string) => void;
  searchTerm?: string;
}

export const Matrix = ({ columns = [], rows = [], presentationOptions }: MatrixProps) => {
  const [startColumn, dispatch] = useReducer(matrixStartColumnReducer, 0);
  const [numberOfColumnsPerPage, setNumberOfColumnsPerPage] = useState(0);
  const tableEl = useRef<HTMLTableElement | null>(null);

  useEffect(() => {
    // Update the number of columns per page when the table is mounted and data comes in, so that we can determine when to show the nav buttons
    const updateNumberOfColumnsPerPage = () => {
      if (!tableEl || !tableEl?.current || !tableEl?.current?.offsetWidth) return;
      const { offsetWidth } = tableEl?.current;
      // 200px is the max width of a column that we want to show
      const maxColumns = Math.floor(offsetWidth / 200);
      setNumberOfColumnsPerPage(Math.min(maxColumns, columns.length));
    };

    updateNumberOfColumnsPerPage();
  }, [tableEl?.current?.offsetWidth, columns]);

  return (
    <MatrixContext.Provider
      value={{
        presentationOptions,
        columns,
        rows,
        startColumn,
        numberOfColumnsPerPage,
      }}
    >
      <MatrixStartColumnDispatchContext.Provider value={dispatch}>
        <MatrixNavButtons />
        <Table component={MatrixTable} ref={tableEl}>
          <MatrixHeaderRow />
          <MatrixBody />
        </Table>
      </MatrixStartColumnDispatchContext.Provider>
    </MatrixContext.Provider>
  );
};
