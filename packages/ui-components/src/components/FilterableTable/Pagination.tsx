/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Pagination as UIPagination } from '../Pagination';

const Wrapper = styled.div`
  .pagination-wrapper {
    border-top: 1px solid ${({ theme }) => theme.palette.grey['400']};
    background-color: ${({ theme }) => theme.palette.background.paper};
  }
  .MuiSelect-root {
    padding-block: 0.5rem;
    padding-inline: 0.8rem 0.2rem;
  }
`;

interface PaginationProps {
  page: number;
  pageCount: number;
  gotoPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  totalRecords: number;
}

export const Pagination = ({
  page,
  pageCount,
  gotoPage,
  pageSize,
  setPageSize,
  totalRecords,
}: PaginationProps) => {
  if (!totalRecords) return null;

  const handleChangePage = (newPage: number) => {
    gotoPage(newPage);
  };
  return (
    <Wrapper>
      <UIPagination
        page={page}
        pageCount={pageCount}
        onChangePage={handleChangePage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalRecords={totalRecords}
      />
    </Wrapper>
  );
};
