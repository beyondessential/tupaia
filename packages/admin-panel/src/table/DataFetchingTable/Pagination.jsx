/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Pagination as UIPagination } from '@tupaia/ui-components';

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

export const Pagination = ({ page, pageCount, gotoPage, pageSize, setPageSize, totalRecords }) => {
  if (!totalRecords) return null;

  const handleChangePage = newPage => {
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

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  gotoPage: PropTypes.func.isRequired,
  pageSize: PropTypes.number.isRequired,
  setPageSize: PropTypes.func.isRequired,
  totalRecords: PropTypes.number.isRequired,
};
