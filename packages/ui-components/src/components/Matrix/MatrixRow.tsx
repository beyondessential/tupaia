/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import { IconButton, TableRow as MuiTableRow, TableCell, lighten } from '@material-ui/core';
import { KeyboardArrowRight } from '@material-ui/icons';
import styled from 'styled-components';
import { MatrixRowType } from '../../types';
import { hexToRgba } from './utils';
import { MatrixCell } from './MatrixCell';
import {
  MatrixContext,
  MatrixExpandedRowsContext,
  MatrixExpandedRowsDispatchContext,
} from './MatrixContext';

const ExpandIcon = styled(KeyboardArrowRight)<{
  $expanded: boolean;
}>`
  transform: ${({ $expanded }) => ($expanded ? 'rotate(90deg)' : 'rotate(0deg)')};
  transition: transform 0.3s ease-in-out;
`;
const Dot = styled.div<{ $color?: string }>`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  border: 0.375rem solid
    ${({ theme, $color }) =>
      theme.palette.background.default === 'transparent'
        ? 'transparent'
        : hexToRgba(theme.palette.background.default, 0.8)};
  margin: 0 auto;
`;

const DataCell = styled(TableCell)`
  vertical-align: middle;
  text-align: center;
  position: relative;
  z-index: 1;
  padding: 0;
  height: 100%;
  &:hover {
    &:before,
    &:after {
      content: '';
      position: absolute;
      z-index: -1;
      pointer-events: none;
    }
    &:before {
      // do a highlight effect for the column when hovering over a cell
      // fill with transparent black, and go extra tall to cover the whole column. Table overflow:hidden handles overflows
      background-color: rgba(0, 0, 0, 0.2);
      left: 0;
      top: -5000px;
      height: 10000px;
      width: 100%;
    }
    &:after {
      // do a highlight effect for the row when hovering over a cell
      // fill with transparent white, and go extra wide to cover the whole width. Table overflow:hidden handles overflows
      background-color: rgba(255, 255, 2555, 0.1);
      top: 0;
      left: -5000px;
      width: 10000px;
      height: 100%;
    }
  }
`;

const TableRow = styled(MuiTableRow)<{
  $highlighted?: boolean;
  $visible?: boolean;
}>`
  display: ${({ $visible }) => ($visible ? 'table-row' : 'none')};
  height: 100%; // this is so the modal button for the cell fills the whole height of the cell
  background-color: ${({ theme, $highlighted }) =>
    $highlighted ? lighten(theme.palette.background.default, 0.1) : 'transparent'};
`;

const RowHeaderCell = styled(TableCell).attrs({
  component: 'th',
})<{
  $depth: number;
}>`
  padding-left: ${({ $depth }) => `${0.5 + $depth * 1.5}rem`};
  max-width: 25%;
`;

const RowHeaderCellContent = styled.div`
  display: flex;
  align-items: center;
  button {
    margin-right: 0.5rem;
  }
`;

const NonGroupedRowHeaderCell = styled(RowHeaderCell)`
  padding-left: ${({ $depth }) => `${1.5 + $depth * 1.5}rem`};
`;

type MatrixRowTitle = MatrixRowType['title'];
interface MatrixRowProps {
  row: MatrixRowType;
  parents: MatrixRowTitle[];
}

const MatrixRowGroup = ({ row, parents = [] }: MatrixRowProps) => {
  const { children, title } = row;
  const expandedRows = useContext(MatrixExpandedRowsContext);
  const dispatch = useContext(MatrixExpandedRowsDispatchContext)!;
  const { numberOfColumnsPerPage } = useContext(MatrixContext);

  const toggleExpandedRows = (rowTitle: string) => {
    if (expandedRows.includes(rowTitle)) {
      dispatch({ type: 'COLLAPSE_ROW', payload: rowTitle });
    } else {
      dispatch({ type: 'EXPAND_ROW', payload: rowTitle });
    }
  };
  const isExpanded = expandedRows.includes(title);
  const isVisible = parents.every(parent => expandedRows.includes(parent));
  const depth = parents.length;
  return (
    <>
      <TableRow $visible={isVisible} $highlighted={depth ? isVisible : isExpanded}>
        <RowHeaderCell $depth={parents.length}>
          <RowHeaderCellContent>
            <IconButton
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} row`}
              size="small"
              onClick={() => toggleExpandedRows(title)}
            >
              <ExpandIcon $expanded={isExpanded} />
            </IconButton>
            {title}
          </RowHeaderCellContent>
        </RowHeaderCell>
        {/** render empty cells for the rest of the row */}
        {Array(numberOfColumnsPerPage)
          .fill(0)
          .map(() => (
            <TableCell />
          ))}
      </TableRow>
      {children?.map(child => (
        <MatrixRow key={child.title} row={child} parents={[...parents, title]} />
      ))}
    </>
  );
};

export const MatrixRow = ({ row, parents = [] }: MatrixRowProps) => {
  const { children, title } = row;
  const expandedRows = useContext(MatrixExpandedRowsContext);
  const { columns, startColumn, numberOfColumnsPerPage } = useContext(MatrixContext);
  const isVisible = parents.every(parent => expandedRows.includes(parent));
  const depth = parents.length;

  // if is nested render a group
  if (children) return <MatrixRowGroup row={row} parents={parents} />;

  const displayedColumns = columns.slice(startColumn, startColumn + numberOfColumnsPerPage);
  // render a regular row with the title cell and the values
  return (
    <TableRow $visible={isVisible} $highlighted={depth > 0}>
      <NonGroupedRowHeaderCell $depth={parents.length}>{title}</NonGroupedRowHeaderCell>
      {displayedColumns.map(({ key }) => (
        <MatrixCell key={`column-${key}-row-${row.title}-value`} value={row[key]} />
      ))}
    </TableRow>
  );
};
