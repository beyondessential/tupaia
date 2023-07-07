/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import { IconButton, TableRow as MuiTableRow, TableCell, lighten } from '@material-ui/core';
import { KeyboardArrowRight } from '@material-ui/icons';
import styled from 'styled-components';
import { MatrixRowType } from '../../types';
import { MatrixCell } from './MatrixCell';
import { ACTION_TYPES, MatrixContext, MatrixDispatchContext } from './MatrixContext';
import { getDisplayedColumns } from './utils';

const ExpandIcon = styled(KeyboardArrowRight)<{
  $expanded: boolean;
}>`
  transform: ${({ $expanded }) => ($expanded ? 'rotate(90deg)' : 'rotate(0deg)')};
  transition: transform 0.3s ease-in-out;
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

const BaseRowHeaderCell = styled(TableCell).attrs({
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

const NonGroupedRowHeaderCell = styled(BaseRowHeaderCell)`
  padding-left: ${({ $depth }) => `${1.5 + $depth * 1.5}rem`};
`;

type MatrixRowTitle = MatrixRowType['title'];
interface MatrixRowProps {
  row: MatrixRowType;
  parents: MatrixRowTitle[];
}

/**
 * This is a component that renders an expandable/collapsible row in the matrix. It renders the row again for each child inside the row, to handle potentially nested rows.
 */
const ExpandableRow = ({ row, parents = [] }: MatrixRowProps) => {
  const { children, title } = row;
  const dispatch = useContext(MatrixDispatchContext)!;
  const { maxColumns, expandedRows, columns, startColumn } = useContext(MatrixContext);
  const displayedColumns = getDisplayedColumns(columns, startColumn, maxColumns);

  const toggleExpandedRows = (rowTitle: string) => {
    if (expandedRows.includes(rowTitle)) {
      dispatch({ type: ACTION_TYPES.COLLAPSE_ROW, payload: rowTitle });
    } else {
      dispatch({ type: ACTION_TYPES.EXPAND_ROW, payload: rowTitle });
    }
  };
  const isExpanded = expandedRows.includes(title);
  const isVisible = parents.every(parent => expandedRows.includes(parent));
  const depth = parents.length;

  return (
    <>
      <TableRow $visible={isVisible} $highlighted={depth ? isVisible : isExpanded}>
        <BaseRowHeaderCell $depth={parents.length}>
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
        </BaseRowHeaderCell>
        {/** render a cell for each remaining column */}
        {displayedColumns.map(col => (
          <MatrixCell
            key={`row-${row.title}-category-header-${col.key}`}
            value={row[col.key as string]}
            rowTitle={row.title}
            isCategory
          />
        ))}
      </TableRow>
      {children?.map(child => (
        <MatrixRow key={child.title} row={child} parents={[...parents, title]} />
      ))}
    </>
  );
};

/**
 * This is a component that renders a row in the matrix. It renders a MatrixRowGroup component if the row has children, otherwise it renders a regular row.
 */
export const MatrixRow = ({ row, parents = [] }: MatrixRowProps) => {
  const { children, title } = row;
  const { columns, startColumn, maxColumns, expandedRows } = useContext(MatrixContext);
  const isVisible = parents.every(parent => expandedRows.includes(parent));
  const depth = parents.length;

  // if is nested render a group
  if (children) return <ExpandableRow row={row} parents={parents} />;

  const displayedColumns = getDisplayedColumns(columns, startColumn, maxColumns);
  // render a regular row with the title cell and the values
  return (
    <TableRow $visible={isVisible} $highlighted={depth > 0}>
      <NonGroupedRowHeaderCell $depth={parents.length}>{title}</NonGroupedRowHeaderCell>
      {displayedColumns.map(({ key, title }) => (
        <MatrixCell
          key={`column-${key || title}-row-${row.title}-value`}
          value={row[key as string]}
          rowTitle={row.title}
        />
      ))}
    </TableRow>
  );
};
