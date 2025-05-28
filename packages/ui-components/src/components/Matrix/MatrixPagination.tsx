import React from 'react';
import styled from 'styled-components';
import { Pagination, PaginationRoot } from '../Pagination';

const Wrapper = styled.div`
  .MuiSelect-root {
    text-align: left;
  }
  ${PaginationRoot} {
    border-width: 0 1px 1px 1px;
    border-color: ${({ theme }) => theme.palette.divider};
    border-style: solid;
  }
`;

interface MatrixPaginationProps {
  totalRows: number;
  pageSize: number;
  pageIndex: number;
  columnsCount: number;
  handleChangePage: (newPage: number) => void;
}

export const MatrixPagination = ({
  totalRows,
  pageSize,
  pageIndex,
  handleChangePage,
}: MatrixPaginationProps) => {
  const pageCount = Math.ceil(totalRows / pageSize);
  if (pageCount === 1) return null;
  return (
    <Wrapper>
      <Pagination
        page={pageIndex}
        onChangePage={handleChangePage}
        pageCount={pageCount}
        pageSize={pageSize}
        totalRecords={totalRows}
        applyRowsPerPage={false}
        showEntriesCount={false}
      />
    </Wrapper>
  );
};
