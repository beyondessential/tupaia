import React, { useReducer, useRef, useState } from 'react';
import styled from 'styled-components';
import { Table, TableBody, TableContainer } from '@material-ui/core';
import { MatrixHeader } from './MatrixHeader';
import { MatrixContext, MatrixDispatchContext, MatrixProps, matrixReducer } from './MatrixContext';
import { MatrixRow } from './MatrixRow';
import { MatrixLegend } from './MatrixLegend';
import { MatrixPagination } from './MatrixPagination';

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

const DEFAULT_PAGE_SIZE = 50;

export const Matrix = ({ columns = [], rows = [], disableExpand, ...config }: MatrixProps) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [{ expandedRows }, dispatch] = useReducer(matrixReducer, {
    expandedRows: [],
  });
  const tableEl = useRef<HTMLTableElement | null>(null);

  const pageStart = pageIndex * DEFAULT_PAGE_SIZE;
  const pageEnd = pageStart + DEFAULT_PAGE_SIZE;
  const visibleRows = rows.slice(pageStart, pageEnd);

  const onPageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
    if (tableEl.current) {
      // scroll to the top of the table when changing pages
      tableEl.current.scrollIntoView({ behavior: 'auto' });
    }
  };

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
            <MatrixHeader onPageChange={onPageChange} />
            <TableBody>
              {visibleRows.map((row, i) => (
                <MatrixRow row={row} key={`${row.title}-${i}`} parents={[]} index={i + 1} />
              ))}
            </TableBody>
          </Table>
        </ScrollContainer>
        <MatrixPagination
          totalRows={rows.length}
          pageSize={DEFAULT_PAGE_SIZE}
          pageIndex={pageIndex}
          handleChangePage={onPageChange}
          columnsCount={columns.length}
        />
      </MatrixDispatchContext.Provider>
    </MatrixContext.Provider>
  );
};
