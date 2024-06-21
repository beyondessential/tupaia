/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { generatePath, useSearchParams, Link, useLocation } from 'react-router-dom';
import { FilterableTable } from '@tupaia/ui-components';
import { DatatrakWebTasksRequest, TaskStatus } from '@tupaia/types';
import { Button } from '../../../components';
import { useCurrentUserContext, useTasks } from '../../../api';
import { displayDate } from '../../../utils';
import { ROUTES } from '../../../constants';
import { StatusPill } from '../StatusPill';
import { StatusFilter } from './StatusFilter';
import { DueDateFilter } from './DueDateFilter';

type Task = DatatrakWebTasksRequest.ResBody['tasks'][0];

const ActionButtonComponent = styled(Button).attrs({
  color: 'primary',
  size: 'small',
})`
  padding-inline: 1.2rem;
  padding-block: 0.4rem;
  width: 100%;
  .MuiButton-label {
    font-size: 0.75rem;
    line-height: normal;
  }
  .cell-content:has(&) {
    padding-block: 0.2rem;
    padding-inline-start: 1.5rem;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 3px;
  .MuiTableContainer-root {
    border-radius: 3px;
  }
`;

const ActionButton = (task: Task) => {
  const location = useLocation();
  if (!task) return null;
  const { assignee, survey, entity, status } = task;
  if (status === TaskStatus.cancelled || status === TaskStatus.completed) return null;
  if (!assignee) {
    return <ActionButtonComponent variant="outlined">Assign</ActionButtonComponent>;
  }

  const surveyLink = generatePath(ROUTES.SURVEY, {
    surveyCode: survey.code,
    countryCode: entity.countryCode,
  });
  return (
    <ActionButtonComponent
      component={Link}
      to={surveyLink}
      variant="contained"
      state={{
        from: JSON.stringify(location),
      }}
    >
      Complete
    </ActionButtonComponent>
  );
};

const COLUMNS = [
  {
    // only the survey name can be resized
    Header: 'Survey',
    accessor: (row: any) => row.survey.name,
    id: 'survey.name',
    filterable: true,
  },
  {
    Header: 'Entity',
    accessor: (row: any) => row.entity.name,
    id: 'entity.name',
    filterable: true,
    disableResizing: true,
  },
  {
    Header: 'Assignee',
    accessor: row => row.assignee?.name ?? 'Unassigned',
    id: 'assignee_name',
    filterable: true,
    disableResizing: true,
  },
  {
    Header: 'Repeating task',
    // TODO: Update this display once RN-1341 is done. Also handle sorting on this column in this issue.
    accessor: row =>
      row.status === TaskStatus.repeating ? JSON.stringify(row.repeatFrequency) : 'Doesn’t repeat',
    id: 'repeat_schedule',
    filterable: true,
    disableResizing: true,
  },
  {
    Header: 'Due Date',
    accessor: row => displayDate(row.dueDate),
    id: 'due_date',
    filterable: true,
    Filter: DueDateFilter,
    disableResizing: true,
  },
  {
    Header: 'Status',
    filterable: true,
    accessor: 'status',
    id: 'status',
    Cell: ({ value }: { value: TaskStatus }) => <StatusPill status={value} />,
    Filter: StatusFilter,
    disableResizing: true,
  },
  {
    Header: '',
    accessor: row => <ActionButton {...row} />,
    id: 'actions',
    filterable: false,
    disableSortBy: true,
    disableResizing: true,
  },
];

const useTasksTable = () => {
  const { projectId } = useCurrentUserContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '0', 10);

  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const URLSortBy = searchParams.get('sortBy');
  const sortBy = URLSortBy ? JSON.parse(URLSortBy) : [];

  const urlFilters = searchParams.get('filters');
  const filters = urlFilters ? JSON.parse(urlFilters) : [];

  const { data, isLoading } = useTasks(projectId, pageSize, page, filters, sortBy);

  const updateSorting = newSorting => {
    setSearchParams({ sortBy: JSON.stringify(newSorting) });
  };

  const updateFilters = newFilters => {
    const nonEmptyFilters = newFilters.filter(({ value }) => !!value);
    if (nonEmptyFilters.length === 0) {
      searchParams.delete('filters');
      setSearchParams(searchParams);
      return;
    }
    setSearchParams({ filters: JSON.stringify(nonEmptyFilters) });
  };

  const onChangePage = newPage => {
    setSearchParams({ page: newPage });
  };

  const onChangePageSize = newPageSize => {
    setSearchParams({ pageSize: newPageSize });
  };

  const { tasks = [], count = 0, numberOfPages = 1 } = data || {};

  return {
    columns: COLUMNS,
    data: tasks,
    totalRecords: count,
    pageIndex: page,
    pageSize,
    sorting: sortBy,
    updateSorting,
    numberOfPages,
    filters,
    updateFilters,
    onChangePage,
    onChangePageSize,
    isLoading,
  };
};

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

  return (
    <Container>
      <FilterableTable
        columns={columns}
        data={data}
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
        noDataMessage="No tasks to display. Click the ‘+ Create task’ button above to add a new task."
        isLoading={isLoading}
      />
    </Container>
  );
};
