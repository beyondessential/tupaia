/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Pagination } from '../Pagination';

const Wrapper = styled.div`
  .MuiSelect-root {
    text-align: left;
  }
  .pagination-wrapper {
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
  handleChangePageSize: (pageSize: number) => void;
}

export const MatrixPagination = ({
  totalRows,
  pageSize,
  pageIndex,
  handleChangePage,
  handleChangePageSize,
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
        setPageSize={handleChangePageSize}
        totalRecords={totalRows}
        pageSizeOptions={[5, 10, 20, 25, 50, -1]}
        applyRowsPerPage={false}
        showEntriesCount={false}
      />
    </Wrapper>
  );
};
