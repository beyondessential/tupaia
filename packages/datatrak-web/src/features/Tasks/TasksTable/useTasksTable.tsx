import React, { useCallback, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { DatatrakWebTasksRequest } from '@tupaia/types';
import { FilterableTableProps } from '@tupaia/ui-components';

import { useCurrentUserContext, useTasks } from '../../../api';
import { UseTasksQueryParams } from '../../../api/queries/useTasks';
import { TaskStatusType } from '../../../types';
import { displayDate, isNotNullish, isNullish } from '../../../utils';
import { CommentsCount } from '../CommentsCount';
import { DueDatePicker } from '../DueDatePicker';
import { StatusDot, StatusPill } from '../StatusPill';
import { TaskActionsMenu } from '../TaskActionsMenu';
import { getDisplayRepeatSchedule } from '../utils';
import { ActionButton } from './ActionButton';
import { RepeatScheduleFilter } from './RepeatScheduleFilter';
import { StatusFilter } from './StatusFilter';

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

export function useTasksTable() {
  const { projectId } = useCurrentUserContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number.parseInt(searchParams.get('page') || '0', 10);
  const pageSize = Number.parseInt(searchParams.get('pageSize') || '20', 10);

  const urlSortBy = searchParams.get('sortBy');
  const sortBy: UseTasksQueryParams['sortBy'] = urlSortBy ? JSON.parse(urlSortBy) : [];

  const urlFilters = searchParams.get('filters');
  const filters = useMemo(() => (urlFilters ? JSON.parse(urlFilters) : []), [urlFilters]);

  const { data, isLoading } = useTasks({ filters, page, pageSize, projectId, sortBy });

  const updateSorting = useCallback(
    (newSorting: UseTasksQueryParams['sortBy']) => {
      if (isNullish(newSorting) || newSorting.length === 0) {
        searchParams.delete('sortBy');
      } else {
        searchParams.set('sortBy', JSON.stringify(newSorting));
      }
      setSearchParams(searchParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const updateFilters: FilterableTableProps['onChangeFilters'] = useCallback(
    newFilters => {
      const nonEmptyFilters = newFilters.filter(({ value }) => isNotNullish(value) && value !== '');
      const nonEmptyFiltersStr = JSON.stringify(nonEmptyFilters);

      if (nonEmptyFiltersStr === JSON.stringify(filters)) return;

      if (nonEmptyFilters.length === 0) {
        searchParams.delete('filters');
      } else {
        searchParams.set('filters', nonEmptyFiltersStr);
        searchParams.set('page', '0');
      }

      setSearchParams(searchParams, { replace: true });
    },
    [filters, searchParams, setSearchParams],
  );

  const onChangePage: FilterableTableProps['onChangePage'] = useCallback(
    newPage => {
      searchParams.set('page', newPage.toString());
      setSearchParams(searchParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const onChangePageSize: FilterableTableProps['onChangePageSize'] = useCallback(
    newPageSize => {
      searchParams.set('pageSize', newPageSize.toString());
      searchParams.set('page', '0');
      setSearchParams(searchParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

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
      Header: 'Due date',
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
}
