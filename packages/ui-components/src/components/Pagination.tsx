/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { IconButton, Input, Typography } from '@material-ui/core';
import styled from 'styled-components';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { Select } from './Inputs';

const Wrapper = styled.div`
  font-size: 0.75rem;
  display: flex;
  justify-content: space-between;
  width: 100%;

  padding-block: 0.5rem;
  padding-inline: 1rem;
  label,
  p,
  .MuiInputBase-input {
    font-size: 0.75rem;
  }

  ${({ theme }) => theme.breakpoints.down('sm')} {
    padding-inline: 0.5rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
`;

const ActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  row-gap: 0.5rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    :first-child {
      padding-inline-start: 1rem;
    }
  }
`;

const RowWrapper = styled(ActionsWrapper)`
  ${({ theme }) => theme.breakpoints.down('sm')} {
    width: 100%;
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
  }
`;

interface PageSelectComponentProps {
  onChangePage: (newPage: number) => void;
  page: number;
  pageCount: number;
}

const PageSelectComponent = ({ onChangePage, page, pageCount }: PageSelectComponentProps) => {
  const pageDisplay = page + 1;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPage = e.target.value ? Number(e.target.value) - 1 : 0;
    onChangePage(newPage);
  };
  return (
    <ActionsWrapper>
      <ManualPageInputContainer>
        <Text id="page-label" htmlFor="page" as="label">
          Page
        </Text>
        <ManualPageInput
          type="number"
          value={pageDisplay}
          onChange={onChange}
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

interface RowsSelectComponentProps {
  pageSize: number;
  setPageSize?: (pageSize: number) => void;
  pageSizeOptions: number[];
}

const RowsSelectComponent = ({
  pageSize,
  setPageSize,
  pageSizeOptions,
}: RowsSelectComponentProps) => {
  const displayOptions = pageSizeOptions.map(size => {
    return { label: `Rows per page: ${size}`, value: size };
  });

  const handlePageSizeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (!setPageSize) return;
    setPageSize(Number(event.target.value));
  };
  return (
    <ActionsWrapper>
      <RowsSelect
        value={pageSize}
        onChange={handlePageSizeChange}
        options={displayOptions}
        variant="standard"
      />
    </ActionsWrapper>
  );
};

interface PaginationProps {
  page: number;
  pageCount: number;
  onChangePage: PageSelectComponentProps['onChangePage'];
  pageSize: number;
  setPageSize?: RowsSelectComponentProps['setPageSize'];
  totalRecords: number;
  pageSizeOptions?: RowsSelectComponentProps['pageSizeOptions'];
  applyRowsPerPage?: boolean;
  showEntriesCount?: boolean;
  alwaysDisplay?: boolean;
}
export const Pagination = ({
  page,
  pageCount,
  onChangePage,
  pageSize,
  setPageSize,
  totalRecords,
  pageSizeOptions = [5, 10, 20, 25, 50, 100],
  applyRowsPerPage = true,
  showEntriesCount = true,
  alwaysDisplay = false,
}: PaginationProps) => {
  if (!totalRecords && !alwaysDisplay) return null;
  const currentDisplayStart = page * pageSize + 1;
  const currentDisplayEnd = Math.min((page + 1) * pageSize, totalRecords);

  const getEntriesText = () => {
    if (!totalRecords) return '';
    return `${currentDisplayStart} - ${currentDisplayEnd} of ${totalRecords} entries`;
  };

  const entriesText = getEntriesText();

  return (
    <Wrapper className="pagination-wrapper">
      <ActionsWrapper>{showEntriesCount && <Text>{entriesText}</Text>}</ActionsWrapper>
      <RowWrapper>
        {applyRowsPerPage && (
          <RowsSelectComponent
            pageSize={pageSize}
            setPageSize={setPageSize}
            pageSizeOptions={pageSizeOptions}
          />
        )}
        <PageSelectComponent onChangePage={onChangePage} page={page} pageCount={pageCount} />
      </RowWrapper>
    </Wrapper>
  );
};
