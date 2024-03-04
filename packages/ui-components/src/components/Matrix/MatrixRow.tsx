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

const depthCalc = (depth: number) => `${2.5 + depth * 2}rem`;

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
  padding-block: 0.7rem;
  padding-inline-end: 0.7rem;
`;

const ExpandableRowHeaderCellContent = styled(RowHeaderCellContent).attrs({
  as: Button,
  variant: 'text',
  color: 'default',
  disableRipple: true,
})<ButtonProps>`
  text-transform: none;
  text-align: left;
  border-radius: 0;
  min-width: 10rem; // so that the cell doesn't wrap too much on small screens
  padding-inline-start: 0; // the button gives the visual appearance of more padding on the left so reset this to 0

  svg {
    margin-inline-end: 0.5rem;
  }
  @media screen and (max-width: 600px) {
    padding: 0.4rem;
    .MuiButton-label span {
      word-break: break-word;
    }
  }
  &:focus,
  &:hover {
    background-color: initial;
  }
`;

const TableRow = styled(MuiTableRow)<{
  $visible?: boolean;
  $isChild?: boolean;
  $depth: number;
}>`
  display: ${({ $visible }) => ($visible ? 'table-row' : 'none')};
  height: 100%; // this is so the modal button for the cell fills the whole height of the cell
  position: relative; // this is so that the hover border can be positioned absolutely over just the row

  // apply a border to the top of the child rows using pseudo classes so we can control the width and the still see the border when the row is scrolled horizontally
  ${Cell}:before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    pointer-events: none; // don't let the cell interfere with the button events
    border-style: solid;
    border-color: ${({ theme }) => theme.palette.divider};
    border-width: ${({ $isChild }) => ($isChild ? '1px 0 0 0' : '0')};
    :is(th) {
      width: ${({ $depth }) => `calc(100% - ${depthCalc($depth)})`}; // the row header is indented
    }
  }
  // for the first row of a group that is expanded and the immediate sibling of another expanded tow, add a border to the top of the row
  &.child
    + &.parent.highlighted:not(
      :has(${ExpandableRowHeaderCellContent}:where(:hover, :focus-visible))
    ) {
    ${Cell}:before {
      border-width: 1px 0 0 0;
      :is(th) {
        width: calc(
          100% - ${depthCalc(1)}
        ); // give the illusion that the border belongs to the bottom of the previous row, because we can't select a prev sibling in css
      }
    }
  }

  // apply the hover effect to the cells instead of the row, so that when the row is scrolled horizontally, the left border doesn't get hidden
  &:has(${ExpandableRowHeaderCellContent}:where(:hover, :focus-visible)) {
    ${Cell}:before {
      content: ''; // set this to an empty string so the border always shows when the button is hovered
      width: 100%;
      border-color: ${({ theme }) => theme.palette.text.primary};
      border-width: 1px 0;
    }
    :first-child:before {
      border-left-width: 1px; // add a left border to the first cell of the row
    }
    :last-child:before {
      border-right-width: 1px; // add a right border to the last cell of the row
    }
    // remove the top border from the first cell of the next row to fix the double border issue
    + tr ${Cell}:before {
      border-top: none;
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
  min-width: ${({ $depth, $characterLength = 0 }) => {
    if ($depth > 0) {
      if ($characterLength < 30) return `calc(20ch + ${depthCalc($depth)})`; // make up for indenting the content
      return `calc(10ch + ${depthCalc($depth)})`;
    }
    if ($characterLength < 30) return '20ch';
    return '10ch';
  }};
  // indent each nested level slightly more
  padding-inline-start: ${({ $depth }) => $depth > 0 && depthCalc($depth)};
  // reset the padding so that we can control it in the content because we have indented content with a top border that covers the remaining width of the cell
  padding-block-start: 0;
  padding-block-end: 0;
  padding-inline-end: 0;
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
    const highlightedClass = (isExpanded && !disableExpand) || depth > 0 ? 'highlighted' : '';
    const matrixClass = 'matrix';
    const childClass = depth > 0 ? 'child' : 'parent';

    const baseClass = `${matrixClass} ${highlightedClass} ${childClass}`;
    if (depth > 0 || index === undefined) return baseClass;
    if (index % 2 === 0) return `${baseClass} even`;
    return `${baseClass} odd`;
  };

  const classNames = getClassNames();

  return (
    <>
      <TableRow $visible={isVisible} className={classNames} $isChild={depth > 0} $depth={depth}>
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
      {isExpanded &&
        children?.map(child => (
          <MatrixRow key={child.title} row={child} parents={[...parents, title]} />
        ))}
    </>
  );
};
