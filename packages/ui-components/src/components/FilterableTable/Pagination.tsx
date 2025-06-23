import React from 'react';
import styled from 'styled-components';
import {
  PaginationRoot,
  Pagination as UIPagination,
  PaginationProps as UIPaginationProps,
} from '../Pagination';

const Wrapper = styled.div`
  ${PaginationRoot} {
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

interface PaginationProps
  extends Pick<
    UIPaginationProps,
    'page' | 'pageCount' | 'onChangePage' | 'pageSize' | 'totalRecords'
  > {
  onChangePageSize: (pageSize: number) => void;
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
