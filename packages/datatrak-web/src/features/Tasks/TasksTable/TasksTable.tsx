import React from 'react';
import styled from 'styled-components';

import { FilterableTable } from '@tupaia/ui-components';

import { isFeatureEnabled } from '@tupaia/utils';

import { useIsMobile } from '../../../utils';
import { FilterToolbar } from './FilterToolbar';
import { MobileTaskFilters } from './MobileTaskFilters';
import { useTasksTable } from './useTasksTable';

const Container = styled.div`
  background-color: ${props => props.theme.palette.background.paper};
  border-radius: 0.1875rem;
  border: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  display: flex;
  flex-direction: column;
  flex: 1;
  max-block-size: 100%;
  .MuiTableContainer-root {
    border-radius: 0.1875rem;
    max-block-size: 100%;
  }

  ${props => props.theme.breakpoints.down('sm')} {
    border: none;
    border-radius: 0;
    th.MuiTableCell-root {
      border: none;
    }
    table .MuiTableRow-head:nth-child(2) {
      display: none;
    }
  }
`;

const canCreateTaskOnMobile = isFeatureEnabled('DATATRAK_MOBILE_CREATE_TASK');

export const TasksTable = () => {
  const {
    columns,
    data,
    pageIndex,
    pageSize,
    sorting,
    updateSorting,
    totalRecords,
    numberOfPages,
    filters,
    updateFilters,
    onChangePage,
    onChangePageSize,
    isLoading,
  } = useTasksTable();
  const isMobile = useIsMobile();

  return (
    <Container>
      {!isMobile && <FilterToolbar />}
      <FilterableTable
        columns={columns}
        data={isLoading ? [] : data}
        pageIndex={pageIndex}
        pageSize={pageSize}
        sorting={sorting}
        onChangeSorting={updateSorting}
        totalRecords={totalRecords}
        numberOfPages={numberOfPages}
        onChangeFilters={updateFilters}
        filters={filters}
        onChangePage={onChangePage}
        onChangePageSize={onChangePageSize}
        noDataMessage={
          !isMobile || canCreateTaskOnMobile
            ? 'No tasks to display. Click the ‘+ Create task’ button above to add a new task.'
            : 'No tasks to display'
        }
        isLoading={isLoading}
      />
      {isMobile && (
        <MobileTaskFilters
          filters={filters}
          onChangeFilters={updateFilters}
          resultCount={totalRecords}
        />
      )}
    </Container>
  );
};
