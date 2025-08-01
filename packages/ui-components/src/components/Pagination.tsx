import { IconButton, Input, Typography } from '@material-ui/core';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import styled from 'styled-components';

import { Select } from './Inputs';

export const PaginationRoot = styled.div`
  display: flex;
  font-size: 0.75rem;
  justify-content: space-between;
  padding-block: 0.5rem;
  padding-inline: 1rem;
  inline-size: 100%;

  label,
  p,
  .MuiInputBase-input,
  .MuiInputBase-root,
  .MuiSelect-root {
    font-size: inherit;
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
  border: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  font-size: 1.2rem;
  padding: 0.4rem;

  & + & {
    margin-inline-start: 0.7rem;
  }
`;

const ManualPageInputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-inline-start: 0.5rem;
  margin-inline-end: 0.8rem;
`;

const ManualPageInput = styled(Input)`
  --padding-inline-end: 0.2rem;
  --padding-inline-start: 0.8rem;
  border-radius: 0.25rem;
  border: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  font-size: inherit;
  font-variant-numeric: lining-nums tabular-nums;
  inline-size: calc(8ch + var(--padding-inline-start) + var(--padding-inline-end));
  margin-inline: 0.5rem;
  padding-inline: var(--padding-inline-start) var(--padding-inline-end);

  .MuiInputBase-input {
    text-align: center;
  }
`;

const Text = styled(Typography)`
  font-size: inherit;
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
  const isPageCountKnown = Number.isFinite(pageCount);

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
          value={page + 1 /* Make 1-indexed */}
          onChange={onChange}
          inputProps={{ min: 1, max: isPageCountKnown ? pageCount : undefined }}
          aria-describedby="page-count"
          id="page"
          disableUnderline
        />
        <Text id="page-count">of {isPageCountKnown ? pageCount.toLocaleString() : 'many'}</Text>
      </ManualPageInputContainer>
      <Button
        onClick={() => onChangePage(page - 1)}
        disabled={page === 0}
        aria-label="Previous page"
      >
        <ChevronLeft />
      </Button>
      <Button
        onClick={() => onChangePage(page + 1)}
        disabled={page === pageCount - 1}
        aria-label="Next page"
      >
        <ChevronRight />
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
  const displayOptions = pageSizeOptions.map(size => ({
    label: `${size} rows per page`,
    value: size,
  }));

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

export interface PaginationProps {
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
  ...props
}: PaginationProps) => {
  if (!totalRecords && !alwaysDisplay) return null;

  const renderEntriesCount = () => {
    const hasKnownCount = Number.isFinite(totalRecords);
    const endOfThisPage = (page + 1) * pageSize;

    const [start, end, total] = [
      page * pageSize + 1,
      hasKnownCount ? Math.min(endOfThisPage, totalRecords) : endOfThisPage,
      hasKnownCount ? totalRecords : 'many',
    ].map(num => num.toLocaleString());

    return (
      <Text>
        {start}&ndash;{end} of {total}
      </Text>
    );
  };

  return (
    <PaginationRoot {...props}>
      <ActionsWrapper>{showEntriesCount && renderEntriesCount()}</ActionsWrapper>
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
    </PaginationRoot>
  );
};
