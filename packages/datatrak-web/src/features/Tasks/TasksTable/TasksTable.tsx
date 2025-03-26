import React from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { DatatrakWebTasksRequest } from '@tupaia/types';
import { FilterableTable } from '@tupaia/ui-components';

import { useCurrentUserContext, useTasks } from '../../../api';
import { TaskStatusType } from '../../../types';
import { displayDate, isNotNullish } from '../../../utils';
import { CommentsCount } from '../CommentsCount';
import { DueDatePicker } from '../DueDatePicker';
import { StatusDot, StatusPill } from '../StatusPill';
import { TaskActionsMenu } from '../TaskActionsMenu';
import { getDisplayRepeatSchedule } from '../utils';
import { ActionButton } from './ActionButton';
import { FilterToolbar } from './FilterToolbar';
import { MobileTaskFilters } from './MobileTaskFilters';
import { RepeatScheduleFilter } from './RepeatScheduleFilter';
import { StatusFilter } from './StatusFilter';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  max-height: 100%;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 3px;
  .MuiTableContainer-root {
    border-radius: 3px;
    max-height: 100%;
  }

  ${({ theme }) => theme.breakpoints.down('sm')} {
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

const ActionCellContent = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const StatusCellContent = styled.div`
  display: flex;
  justify-content: space-between;
  a:has(&) {
    // This is a workaround to make the comments count display at the edge of the cell
    padding-inline-end: 0;
  }
`;

const StatusPillContent = styled.div`
  display: flex;
  align-items: center;
  > div {
    margin-inline-end: 0.5rem;
    ${({ theme }) => theme.breakpoints.up('sm')} {
      display: none;
    }
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const useTasksTable = () => {
  const { projectId } = useCurrentUserContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '0', 10);

  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const URLSortBy = searchParams.get('sortBy');
  const sortBy = URLSortBy ? JSON.parse(URLSortBy) : [];

  const urlFilters = searchParams.get('filters');
  const filters = urlFilters ? JSON.parse(urlFilters) : [];

  const { data, isLoading } = useTasks({ projectId, pageSize, page, filters, sortBy });

  const updateSorting = newSorting => {
    searchParams.set('sortBy', JSON.stringify(newSorting));
    setSearchParams(searchParams);
  };

  const updateFilters = newFilters => {
    const nonEmptyFilters = newFilters.filter(({ value }) => isNotNullish(value) && value !== '');

    if (JSON.stringify(nonEmptyFilters) === JSON.stringify(filters)) return;

    if (nonEmptyFilters.length === 0) {
      searchParams.delete('filters');
      setSearchParams(searchParams);
      return;
    }

    searchParams.set('filters', JSON.stringify(nonEmptyFilters));
    searchParams.set('page', '0');

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

  const location = useLocation();

  const COLUMNS = [
    {
      // only the survey name can be resized
      Header: 'Survey',
      Cell: ({
        row,
      }: {
        row: {
          original: DatatrakWebTasksRequest.ResBody['tasks'][0];
        };
      }) => {
        const value = row?.original?.survey?.name || '';
        const status = row?.original?.taskStatus || '';
        return (
          <StatusPillContent>
            <StatusDot $status={status} />
            <span>{value}</span>
          </StatusPillContent>
        );
      },
      id: 'survey.name',
      filterable: true,
    },
    {
      Header: 'Entity',
      accessor: (row: any) => row.entity.name,
      id: 'entity.name',
      filterable: true,
      disableResizing: true,
      width: 180,
    },
    {
      Header: 'Assignee',
      accessor: row => row.assignee.name,
      id: 'assignee_name',
      filterable: true,
      disableResizing: true,
      width: 180,
    },
    {
      Header: 'Repeating task',
      accessor: row => getDisplayRepeatSchedule(row),
      id: 'repeat_schedule',
      filterable: true,
      disableResizing: true,
      Filter: RepeatScheduleFilter,
      disableSortBy: true,
      width: 180,
    },
    {
      Header: 'Due Date',
      accessor: row => displayDate(row.taskDueDate),
      // use the due_date field to sort (unix timestamp) and the taskDueDate field to display (date string)
      id: 'due_date',
      filterable: true,
      Filter: DueDatePicker,
      disableResizing: true,
      width: 180,
    },
    {
      Header: 'Status',
      filterable: true,
      accessor: 'taskStatus',
      id: 'task_status',
      Cell: ({
        value,
        row,
      }: {
        value: TaskStatusType;
        row: {
          original: DatatrakWebTasksRequest.ResBody['tasks'][0];
        };
      }) => {
        return (
          <StatusCellContent>
            <StatusPill status={value} />
            <CommentsCount commentsCount={row.original.commentsCount} />
          </StatusCellContent>
        );
      },
      Filter: StatusFilter,
      disableResizing: true,
      width: 180,
    },
    {
      Header: '',
      width: 200,
      accessor: task => (
        <ActionCellContent>
          <ActionButton task={task} />
          <TaskActionsMenu task={task} />
        </ActionCellContent>
      ),
      id: 'actions',
      filterable: false,
      disableSortBy: true,
      disableResizing: true,
    },
  ].map(column => {
    if (column.id === 'actions') return column;
    return {
      ...column,
      generateUrl: row => {
        return {
          to: `/tasks/${row.id}`,
          state: {
            from: `${location.pathname}${location.search}`,
          },
        };
      },
    };
  });

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
      <MobileTaskFilters onChangeFilters={updateFilters} filters={filters} />
    </Container>
  );
};
