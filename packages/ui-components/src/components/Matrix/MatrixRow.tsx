/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { IconButton, TableRow, TableCell, lighten } from '@material-ui/core';
import { KeyboardArrowRight } from '@material-ui/icons';
import styled from 'styled-components';
import { MatrixColumnType, MatrixRowType } from '../../types';
import { getIsUsingDots, getPresentationOption, hexToRgba } from './utils';

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

const Cell = styled(TableCell)`
  vertical-align: middle;
  text-align: center;
  position: relative;
  z-index: 1;
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

const BaseRow = styled(TableRow)<{
  $highlighted?: boolean;
  $visible?: boolean;
}>`
  background-color: ${({ theme, $highlighted }) =>
    $highlighted ? lighten(theme.palette.background.default, 0.1) : 'transparent'};
`;

const CollapsibleTableRow = styled(BaseRow)`
  display: ${({ $visible }) => ($visible ? 'table-row' : 'none')};
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

export const MatrixRow = ({
  row,
  displayedColumns,
  expanded,
  toggleExpanded,
  isNested = false,
  parents = [],
  presentationOptions,
}: {
  row: MatrixRowType;
  displayedColumns: MatrixColumnType[];
  expanded: MatrixRowTitle[];
  toggleExpanded: (title: MatrixRowTitle) => void;
  isNested: boolean;
  parents: MatrixRowTitle[];
  presentationOptions: any;
}) => {
  const { children, title } = row;
  const isExpanded = expanded.includes(title);
  const isVisible = parents.every(parent => expanded.includes(parent));
  const Component = isNested ? CollapsibleTableRow : BaseRow;
  const depth = parents.length;
  if (children)
    return (
      <>
        <Component $visible={isVisible} $highlighted={depth ? isVisible : isExpanded}>
          <RowHeaderCell $depth={parents.length}>
            <RowHeaderCellContent>
              <IconButton
                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} row`}
                size="small"
                onClick={() => toggleExpanded(title)}
              >
                <ExpandIcon $expanded={isExpanded} />
              </IconButton>
              {title}
            </RowHeaderCellContent>
          </RowHeaderCell>
          {/** render empty cells for the rest of the row */}
          {Array(displayedColumns.length)
            .fill(0)
            .map(() => (
              <TableCell />
            ))}
        </Component>
        {children.map(child => (
          <MatrixRow
            row={child}
            displayedColumns={displayedColumns}
            expanded={expanded}
            toggleExpanded={toggleExpanded}
            isNested
            parents={[...parents, title]}
            presentationOptions={presentationOptions}
          />
        ))}
      </>
    );
  const displayValues = displayedColumns.map(({ key }) => {
    const value = row[key];
    if (!getIsUsingDots(presentationOptions)) return value;
    const presentation = getPresentationOption(presentationOptions, value);
    const color = presentation?.color;
    return <Dot $color={color} aria-label={value} />;
  });
  return (
    <Component $visible={isVisible} $highlighted={depth > 0}>
      <NonGroupedRowHeaderCell $depth={parents.length}>{title}</NonGroupedRowHeaderCell>
      {displayValues.map(item => (
        <Cell>{item}</Cell>
      ))}
    </Component>
  );
};
