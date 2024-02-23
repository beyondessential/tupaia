/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import { ButtonProps, TableRow as MuiTableRow } from '@material-ui/core';
import { KeyboardArrowRight } from '@material-ui/icons';
import styled from 'styled-components';
import { MatrixRowType } from '../../types';
import { Button } from '../Button';
import { MatrixCell } from './MatrixCell';
import { ACTION_TYPES, MatrixContext, MatrixDispatchContext } from './MatrixContext';
import { CellButton } from './CellButton';
import { Cell } from './Cell';

const ExpandIcon = styled(KeyboardArrowRight)<{
  $expanded?: boolean;
}>`
  transform: ${({ $expanded }) => ($expanded ? 'rotate(90deg)' : 'rotate(0deg)')};
  transition: transform 0.3s ease-in-out;
`;

const RowHeaderCellContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
  padding-right: 1.5rem;
  padding-top: 0.7rem;
`;

const TableRow = styled(MuiTableRow)<{
  $visible?: boolean;
  $isChild?: boolean;
}>`
  display: ${({ $visible }) => ($visible ? 'table-row' : 'none')};
  height: 100%; // this is so the modal button for the cell fills the whole height of the cell
  td,
  ${RowHeaderCellContent} {
    border-top: ${({ $isChild, theme }) => $isChild && `1px solid ${theme.palette.divider}`};
  }
`;

const ExpandableRowHeaderCellContent = styled(RowHeaderCellContent).attrs({
  as: Button,
  variant: 'text',
  color: 'default',
})<ButtonProps>`
  // override the padding to match the padding of the cell, so that the button fills the whole cell
  .MuiTableCell-root:has(&) {
    padding: 0;
  }
  text-transform: none;
  text-align: left;
  min-width: 10rem; // so that the cell doesn't wrap too much on small screens
  svg {
    margin-right: 0.5rem;
  }
  @media screen and (max-width: 600px) {
    padding: 0.4rem;
    .MuiButton-label span {
      word-break: break-word;
    }
  }
`;

const HeaderCell = styled(Cell).attrs({
  component: 'th',
  className: 'MuiTableCell-row-head',
})<{
  $depth: number;
}>`
  position: sticky;
  top: 0;
  left: 0;
  z-index: 2;
  padding-top: 0;
  padding-left: ${({ $depth }) => $depth > 0 && `${2.5 + $depth * 2}rem`};
  padding-right: 0; // we want to apply the padding to the content, not the cell so that we can have indented content with a top border that covers the remaining width of the cell
`;

type MatrixRowTitle = MatrixRowType['title'];
interface MatrixRowProps {
  row: MatrixRowType;
  parents: MatrixRowTitle[];
  index?: number;
}

type MatrixRowHeaderProps = {
  depth: number;
  isExpanded: boolean;
  rowTitle: string;
  hasChildren: boolean;
  children: React.ReactNode;
  disableExpandButton: boolean;
  onClick?: MatrixRowType['onClick'];
};

const ExpandableRowHeaderCell = ({
  children,
  isExpanded,
  depth,
  disableExpandButton,
  toggleExpandedRows,
}: Pick<MatrixRowHeaderProps, 'children' | 'depth' | 'isExpanded' | 'disableExpandButton'> & {
  toggleExpandedRows: () => void;
}) => {
  return (
    <HeaderCell $depth={depth}>
      <ExpandableRowHeaderCellContent
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} row`}
        onClick={toggleExpandedRows}
        disabled={disableExpandButton}
      >
        <ExpandIcon $expanded={isExpanded} />
        <span>{children}</span>
      </ExpandableRowHeaderCellContent>
    </HeaderCell>
  );
};

const ClickableRowHeaderCell = ({
  children,
  onClick,
  depth,
}: Pick<MatrixRowHeaderProps, 'children' | 'onClick' | 'depth'>) => {
  return (
    <HeaderCell $depth={depth}>
      <RowHeaderCellContent onClick={onClick} as={CellButton}>
        {children}
      </RowHeaderCellContent>
    </HeaderCell>
  );
};

/**
 * This component renders the first cell of a row. It renders a button to expand/collapse the row if it has children, otherwise it renders a regular cell.
 */
const RowHeaderCell = ({
  rowTitle,
  depth,
  isExpanded,
  hasChildren,
  children,
  disableExpandButton,
  onClick,
}: MatrixRowHeaderProps) => {
  const dispatch = useContext(MatrixDispatchContext)!;
  const toggleExpandedRows = () => {
    if (isExpanded) {
      dispatch({ type: ACTION_TYPES.COLLAPSE_ROW, payload: rowTitle });
    } else {
      dispatch({ type: ACTION_TYPES.EXPAND_ROW, payload: rowTitle });
    }
  };

  if (hasChildren)
    return (
      <ExpandableRowHeaderCell
        depth={depth}
        isExpanded={isExpanded}
        toggleExpandedRows={toggleExpandedRows}
        disableExpandButton={disableExpandButton}
      >
        {children}
      </ExpandableRowHeaderCell>
    );

  if (onClick)
    return (
      <ClickableRowHeaderCell depth={depth} onClick={onClick}>
        {children}
      </ClickableRowHeaderCell>
    );

  return (
    <HeaderCell
      $characterLength={typeof children === 'string' ? rowTitle?.length : 0}
      $depth={depth}
    >
      <RowHeaderCellContent>{children}</RowHeaderCellContent>
    </HeaderCell>
  );
};

/**
 * This is a recursive component that renders a row in the matrix. It renders a MatrixRowGroup component if the row has children, otherwise it renders a regular row.
 */
export const MatrixRow = ({ row, parents = [], index }: MatrixRowProps) => {
  const { children, title, onClick } = row;
  const { columns, expandedRows, disableExpand = false } = useContext(MatrixContext);

  const isExpanded = expandedRows.includes(title) || disableExpand;
  const isVisible = parents.every(parent => expandedRows.includes(parent)) || disableExpand;
  const depth = parents.length;

  const isCategory = children ? children.length > 0 : false;

  const getClassNames = () => {
    const highlightedClass = 'highlighted';
    const matrixClass = 'matrix';

    const baseClass = isExpanded || depth > 0 ? `${matrixClass} ${highlightedClass}` : matrixClass;
    if (depth > 0 || index === undefined) return baseClass;
    if (index % 2 === 0) return `${baseClass} even`;
    return `${baseClass} odd`;
  };

  const classNames = getClassNames();

  return (
    <>
      <TableRow $visible={isVisible} className={classNames} $isChild={depth > 0}>
        <RowHeaderCell
          isExpanded={isExpanded}
          depth={depth}
          rowTitle={title}
          hasChildren={isCategory}
          disableExpandButton={disableExpand}
          onClick={onClick}
        >
          {title}
        </RowHeaderCell>
        {columns.map(({ key, title: cellTitle }) => (
          <MatrixCell
            key={`column-${key || cellTitle}-row-${title}-value`}
            value={row[key as string]}
            rowTitle={title}
            colKey={key}
            isCategory={isCategory}
          />
        ))}
      </TableRow>
      {children &&
        isExpanded && // if the row has children and is expanded, render the children
        children?.map(child => (
          <MatrixRow key={child.title} row={child} parents={[...parents, title]} />
        ))}
    </>
  );
};
