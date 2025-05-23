import React, { useCallback, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { DatatrakWebTasksRequest } from '@tupaia/types';
import { FilterableTableProps } from '@tupaia/ui-components';

import { useCurrentUserContext, useTasks } from '../../../api';
import { UseTasksQueryParams } from '../../../api/queries/useTasks';
import { TaskStatusType } from '../../../types';
import { displayDate, isNotNullish, isNullish, useIsMobile } from '../../../utils';
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

const StyledStatusDot = styled(StatusDot).attrs({
  // Table still has task status column, so this indicator is redundant
  'aria-hidden': true,
})`
  display: inline-block;
  margin-inline-end: 0.5rem;
`;

const SurveyName = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export function useTasksTable() {
  const { projectId } = useCurrentUserContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const isMobile = useIsMobile();

  const setBooleanSearchParam = useCallback(
    (param: 'allAssignees' | 'cancelled' | 'completed', value: boolean) => {
      if (value) searchParams.set(param, '1');
      else searchParams.delete(param);
      setSearchParams(searchParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const _page = Number.parseInt(searchParams.get('page') || '0', 10);
  const page = Number.isNaN(_page) ? 0 : _page;

  const _pageSize = Number.parseInt(searchParams.get('pageSize') || '20', 10);
  const pageSize = Number.isNaN(_pageSize) ? 20 : _pageSize;

  const _sortBy = searchParams.get('sortBy');
  const sorting: UseTasksQueryParams['sortBy'] = useMemo(
    () => (_sortBy ? JSON.parse(_sortBy) : []),
    [_sortBy],
  );

  const showAllAssignees = searchParams.get('allAssignees') === '1';
  const setShowAllAssignees = useCallback(
    (value: boolean) => setBooleanSearchParam('allAssignees', value),
    [setBooleanSearchParam],
  );

  const showCancelled = searchParams.get('cancelled') === '1';
  const setShowCancelled = useCallback(
    (value: boolean) => setBooleanSearchParam('cancelled', value),
    [setBooleanSearchParam],
  );

  const showCompleted = searchParams.get('completed') === '1';
  const setShowCompleted = useCallback(
    (value: boolean) => setBooleanSearchParam('completed', value),
    [setBooleanSearchParam],
  );

  const _filters = searchParams.get('filters');
  const filters = useMemo(() => (_filters ? JSON.parse(_filters) : []), [_filters]);

  const { data, isFetching, isLoading } = useTasks({
    allAssignees: showAllAssignees,
    filters,
    includeCancelled: showCancelled,
    includeCompleted: showCompleted,
    page,
    pageSize,
    projectId,
    sortBy: sorting,
  });

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

  const columns = [
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
        const status = row?.original?.taskStatus || '';
        return (
          <>
            {isMobile && <StyledStatusDot $status={status} />}
            <SurveyName>{row?.original?.survey?.name}</SurveyName>
          </>
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
    columns,
    data: tasks,
    isFetching,
    isLoading,
    numberOfPages,
    onChangePage,
    onChangePageSize,
    pageIndex: page,
    pageSize,
    totalRecords: count,

    sorting,
    updateSorting,
    filters,
    updateFilters,
    showAllAssignees,
    setShowAllAssignees,
    showCancelled,
    setShowCancelled,
    showCompleted,
    setShowCompleted,
  };
}
