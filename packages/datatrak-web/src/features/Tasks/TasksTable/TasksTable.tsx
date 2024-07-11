/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { FilterableTable } from '@tupaia/ui-components';
import { TaskStatusType } from '../../../types';
import { useCurrentUserContext, useTasks } from '../../../api';
import { displayDate } from '../../../utils';
import { DueDatePicker } from '../DueDatePicker';
import { StatusPill } from '../StatusPill';
import { StatusFilter } from './StatusFilter';
import { ActionButton } from './ActionButton';
import { TaskActionsMenu } from './TaskActionsMenu';
import { FilterToolbar } from './FilterToolbar';

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
    searchParams.set('sortBy', JSON.stringify(newSorting));
    setSearchParams(searchParams);
  };

  const updateFilters = newFilters => {
    const nonEmptyFilters = newFilters.filter(({ value }) => !!value);
    if (nonEmptyFilters.length === 0) {
      searchParams.delete('filters');
      setSearchParams(searchParams);
      return;
    }
    searchParams.set('filters', JSON.stringify(nonEmptyFilters));
    setSearchParams(searchParams);
  };

  const onChangePage = newPage => {
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);
  };

  const onChangePageSize = newPageSize => {
    searchParams.set('pageSize', newPageSize.toString());
    searchParams.set('page', '0');
    setSearchParams(searchParams);
  };

  const { tasks = [], count = 0, numberOfPages } = data || {};

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
      accessor: row => row.assigneeName ?? 'Unassigned',
      id: 'assignee_name',
      filterable: true,
      disableResizing: true,
    },
    {
      Header: 'Repeating task',
      // TODO: Update this display once RN-1341 is done. Also handle sorting on this column in this issue.
      accessor: row => (row.repeatSchedule ? JSON.stringify(row.repeatSchedule) : 'Doesn’t repeat'),
      id: 'repeat_schedule',
      filterable: true,
      disableResizing: true,
    },
    {
      Header: 'Due Date',
      accessor: row => displayDate(row.dueDate),
      id: 'due_date',
      filterable: true,
      Filter: DueDatePicker,
      disableResizing: true,
    },
    {
      Header: 'Status',
      filterable: true,
      accessor: 'taskStatus',
      id: 'task_status',
      Cell: ({ value }: { value: TaskStatusType }) => <StatusPill status={value} />,
      Filter: StatusFilter,
      disableResizing: true,
    },
    {
      Header: '',
      width: 180,
      accessor: task => (
        <>
          <ActionButton task={task} />
          <TaskActionsMenu id={task.id} />
        </>
      ),
      id: 'actions',
      filterable: false,
      disableSortBy: true,
      disableResizing: true,
    },
  ];

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
    isLoading: isLoading,
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
      <FilterToolbar />
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
        noDataMessage="No tasks to display. Click the ‘+ Create task’ button above to add a new task."
        isLoading={isLoading}
      />
    </Container>
  );
};
