import React from 'react';
import styled from 'styled-components';
import { Pagination as UIPagination } from '../Pagination';

const Wrapper = styled.div`
  .pagination-wrapper {
    border-top: 1px solid ${({ theme }) => theme.palette.divider};
    background-color: ${({ theme }) => theme.palette.background.paper};
  }
  .MuiSelect-root {
    padding-block: 0.5rem;
    padding-inline: 0.8rem 0.2rem;
  }
  .MuiOutlinedInput-notchedOutline,
  .MuiInput-root,
  .MuiButtonBase-root {
    border-color: ${({ theme }) => theme.palette.divider};
  }
`;

interface PaginationProps {
  page: number;
  pageCount: number;
  onChangePage: (page: number) => void;
  pageSize: number;
  onChangePageSize: (pageSize: number) => void;
  totalRecords: number;
}

export const Pagination = ({
  page,
  pageCount,
  onChangePage,
  pageSize,
  onChangePageSize,
  totalRecords,
}: PaginationProps) => {
  return (
    <Wrapper>
      <UIPagination
        page={page}
        pageCount={pageCount || 1}
        onChangePage={onChangePage}
        pageSize={pageSize}
        setPageSize={onChangePageSize}
        totalRecords={totalRecords}
        alwaysDisplay
      />
    </Wrapper>
  );
};
