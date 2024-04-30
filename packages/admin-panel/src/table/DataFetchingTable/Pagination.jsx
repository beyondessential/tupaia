/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Input, Typography } from '@material-ui/core';
import styled from 'styled-components';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { Select } from '@tupaia/ui-components';

const Wrapper = styled.div`
  font-size: 0.75rem;
  display: flex;
  justify-content: space-between;
  width: 100%;
  // position: sticky;
  // bottom: 0;
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding-block: 0.5rem;
  padding-inline: 1rem;
  label,
  p,
  .MuiInputBase-input {
    font-size: 0.75rem;
  }
`;

const ActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  :first-child {
    padding-inline-start: 1rem;
  }
`;
const Button = styled(IconButton)`
  border: 1px solid ${({ theme }) => theme.palette.grey['400']};
  padding: 0.4rem;
  .MuiSvgIcon-root {
    font-size: 1.2rem;
  }
  & + & {
    margin-left: 0.7rem;
  }
`;

const ManualPageInputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-inline-start: 0.5rem;
  margin-inline-end: 0.8rem;
`;

const ManualPageInput = styled(Input)`
  border: 1px solid ${({ theme }) => theme.palette.grey['400']};
  border-radius: 4px;
  padding-block: 0.5rem;
  padding-inline: 0.8rem 0.2rem;
  margin-inline: 0.5rem;
  font-size: 0.75rem;
  .MuiInputBase-input {
    text-align: center;
    padding-block: 0;
    height: auto;
  }
`;

const Text = styled(Typography)`
  font-size: 0.75rem;
`;

const RowsSelect = styled(Select)`
  display: flex;
  flex-direction: row;
  margin-block-end: 0;
  margin-inline-end: 1.2rem;
  width: 12rem;
  .MuiSelect-root {
    padding-block: 0.5rem;
    padding-inline: 0.8rem 0.2rem;
  }
`;

const PageSelectComponent = ({ onChangePage, page, pageCount }) => {
  const pageDisplay = page + 1;
  return (
    <ActionsWrapper>
      <ManualPageInputContainer>
        <Text id="page-label" htmlFor="page" component="label">
          Page
        </Text>
        <ManualPageInput
          type="number"
          value={pageDisplay}
          onChange={e => {
            const newPage = e.target.value ? Number(e.target.value) - 1 : '';
            onChangePage(newPage);
          }}
          inputProps={{ min: 1, max: pageCount }}
          aria-describedby="page-count"
          id="page"
          disableUnderline
        />
        <Text id="page-count">of {pageCount}</Text>
      </ManualPageInputContainer>
      <Button
        onClick={() => onChangePage(page - 1)}
        disabled={page === 0}
        aria-label="Previous page"
      >
        <KeyboardArrowLeft />
      </Button>
      <Button
        onClick={() => onChangePage(page + 1)}
        disabled={page === pageCount - 1}
        aria-label="Next page"
      >
        <KeyboardArrowRight />
      </Button>
    </ActionsWrapper>
  );
};

PageSelectComponent.propTypes = {
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
};

const RowsSelectComponent = ({ pageSize, setPageSize }) => {
  const pageSizes = [5, 10, 20, 25, 50, 100];
  return (
    <ActionsWrapper>
      <RowsSelect
        value={pageSize}
        onChange={event => setPageSize(Number(event.target.value))}
        options={pageSizes.map(size => ({ label: `Rows per page: ${size}`, value: size }))}
        variant="standard"
      />
    </ActionsWrapper>
  );
};

RowsSelectComponent.propTypes = {
  pageSize: PropTypes.number.isRequired,
  setPageSize: PropTypes.func.isRequired,
};

export const Pagination = ({ page, pageCount, gotoPage, pageSize, setPageSize, totalRecords }) => {
  if (!totalRecords) return null;
  const currentDisplayStart = page * pageSize + 1;
  const currentDisplayEnd = Math.min((page + 1) * pageSize, totalRecords);

  const handleChangePage = newPage => {
    gotoPage(newPage);
  };
  return (
    <Wrapper>
      <ActionsWrapper>
        <Text>
          {currentDisplayStart} - {currentDisplayEnd} of {totalRecords} entries
        </Text>
      </ActionsWrapper>
      <ActionsWrapper>
        <RowsSelectComponent pageSize={pageSize} setPageSize={setPageSize} />
        <PageSelectComponent onChangePage={handleChangePage} page={page} pageCount={pageCount} />
      </ActionsWrapper>
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
