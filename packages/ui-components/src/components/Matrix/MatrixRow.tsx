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
 * This component renders the first cell of a row. It renders a button to expand/collapse the row if it has children, otherwise it renders a regular cell.
 */
const RowHeaderCell = ({
  rowTitle,
  depth,
  isExpanded,
  hasChildren,
  children,
}: {
  depth: number;
  isExpanded: boolean;
  rowTitle: string;
  hasChildren: boolean;
  children: React.ReactNode;
}) => {
  const dispatch = useContext(MatrixDispatchContext)!;
  const toggleExpandedRows = () => {
    if (isExpanded) {
      dispatch({ type: ACTION_TYPES.COLLAPSE_ROW, payload: rowTitle });
    } else {
      dispatch({ type: ACTION_TYPES.EXPAND_ROW, payload: rowTitle });
    }
  };

  if (!hasChildren)
    return <NonGroupedRowHeaderCell $depth={depth}>{children}</NonGroupedRowHeaderCell>;
  return (
    <BaseRowHeaderCell $depth={depth}>
      <RowHeaderCellContent>
        <IconButton
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} row`}
          size="small"
          onClick={toggleExpandedRows}
        >
          <ExpandIcon $expanded={isExpanded} />
        </IconButton>
        {children}
      </RowHeaderCellContent>
    </BaseRowHeaderCell>
  );
};

/**
 * This is a recursive component that renders a row in the matrix. It renders a MatrixRowGroup component if the row has children, otherwise it renders a regular row.
 */
export const MatrixRow = ({ row, parents = [] }: MatrixRowProps) => {
  const { children, title } = row;
  const { columns, startColumn, maxColumns, expandedRows } = useContext(MatrixContext);

  const displayedColumns = getDisplayedColumns(columns, startColumn, maxColumns);

  const isExpanded = expandedRows.includes(title);
  const isVisible = parents.every(parent => expandedRows.includes(parent));
  const depth = parents.length;

  const isCategory = children ? children.length > 0 : false;

  // render a regular row with the title cell and the values
  return (
    <>
      <TableRow $visible={isVisible} $highlighted={depth > 0}>
        <RowHeaderCell
          isExpanded={isExpanded}
          depth={depth}
          rowTitle={title}
          hasChildren={isCategory}
        >
          {title}
        </RowHeaderCell>
        {displayedColumns.map(({ key, title }) => (
          <MatrixCell
            key={`column-${key || title}-row-${row.title}-value`}
            value={row[key as string]}
            rowTitle={row.title}
            colKey={key}
            isCategory={isCategory}
          />
        ))}
      </TableRow>
      {children?.map(child => (
        <MatrixRow key={child.title} row={child} parents={[...parents, title]} />
      ))}
    </>
  );
};
