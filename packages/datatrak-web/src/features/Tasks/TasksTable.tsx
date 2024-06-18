/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useMemo } from 'react';
import { usePagination, useSortBy, useTable } from 'react-table';
import styled from 'styled-components';
import { generatePath, useSearchParams, Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer as MuiTableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { DatatrakWebTasksRequest, TaskStatus } from '@tupaia/types';
import { Button } from '../../components';
import { useCurrentUserContext, useTasks } from '../../api';
import { displayDate } from '../../utils';
import { ROUTES } from '../../constants';

const TableContainer = styled(MuiTableContainer)`
  background-color: ${({ theme }) => theme.palette.background.paper};
`;

type Task = DatatrakWebTasksRequest.ResBody[0];

const ActionButton = (task: Task) => {
  if (!task) return null;
  const { assignee, survey, entity, status } = task;
  if (
    status === TaskStatus.overdue ||
    status === TaskStatus.cancelled ||
    status === TaskStatus.completed
  )
    return null;
  if (!assignee) {
    return (
      <Button variant="outlined" color="primary">
        Assign
      </Button>
    );
  }

  const surveyLink = generatePath(ROUTES.SURVEY, {
    surveyCode: survey.code,
    countryCode: entity.countryCode,
  });
  return (
    <Button component={Link} to={surveyLink} variant="contained" color="primary">
      Complete
    </Button>
  );
};

const STATUS_VALUES = {
  to_do: 'To Do',
  overdue: 'Overdue',
  repeating: 'Repeating',
  completed: 'Complete',
  cancelled: 'Cancelled',
};

const COLUMNS = [
  {
    Header: 'Survey',
    accessor: (row: any) => row.survey.name,
    id: 'survey.name',
  },
  {
    Header: 'Entity',
    accessor: (row: any) => row.entity.name,
    id: 'entity.name',
  },
  {
    Header: 'Assignee',
    accessor: row => row.assignee?.name ?? 'Unassigned',
    id: 'assignee.name',
  },
  {
    Header: 'Repeating task',
    accessor: row => (row.isRecurring ? row.repeatFrequency : "Doesn't repeat"),
    id: 'repeating',
  },
  {
    Header: 'Due Date',
    accessor: row => displayDate(row.dueDate),
    id: 'dueDate',
  },
  {
    Header: 'Status',
    accessor: row => {
      if (row.isRecurring) {
        return STATUS_VALUES.repeating;
      }
      return STATUS_VALUES[row.status];
    },
    id: 'status',
  },
  {
    Header: '',
    accessor: row => <ActionButton {...row} />,
    id: 'actions',
  },
];

const useTasksTable = () => {
  const { projectId } = useCurrentUserContext();
  const { data: tasks } = useTasks(projectId);
  const [searchParams, setSearchParams] = useSearchParams();
  const data = useMemo(() => tasks || [], [tasks]);

  const page = parseInt(searchParams.get('page') || '0', 10);

  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const URLSortBy = searchParams.get('sortBy');
  const sortBy = URLSortBy ? JSON.parse(URLSortBy) : [];

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    pageCount,
    gotoPage,
    setPageSize,
    visibleColumns,
    setSortBy,
  } = useTable(
    {
      columns: COLUMNS,
      data,
      initialState: {
        pageIndex: page,
        pageSize: pageSize,
        sortBy,
      },
      manualPagination: true,
      manualSortBy: true,
    },
    useSortBy,
    usePagination,
  );

  return {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    pageCount,
    gotoPage,
    setPageSize,
    visibleColumns,
    setSortBy,
  };
};

export const TasksTable = () => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    pageCount,
    gotoPage,
    setPageSize,
    visibleColumns,
    setSortBy,
  } = useTasksTable();

  return (
    <TableContainer>
      <Table {...getTableProps()} stickyHeader>
        <TableHead>
          {headerGroups.map((headerGroup, i) => (
            <TableRow {...headerGroup.getHeaderGroupProps()} key={`header-group-${i}`}>
              {headerGroup.headers.map(column => (
                <TableCell {...column.getHeaderProps()} key={column.id}>
                  {column.render('Header')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <TableRow {...row.getRowProps()} key={row.id}>
                {row.cells.map(cell => (
                  <TableCell {...cell.getCellProps()} key={cell.column.id}>
                    {cell.render('Cell')}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
