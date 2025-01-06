/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { TableCell as MuiTableCell } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { TableResizerProps } from 'react-table';

const Cell = styled(MuiTableCell)<{
  $maxWidth?: number;
}>`
  font-size: 0.75rem;
  padding: 0;
  border: none;
  position: relative;
  max-width: ${({ $maxWidth }) => ($maxWidth ? `${$maxWidth}px` : 'auto')};
  &:first-child {
    padding-inline-start: 1.5rem;
  }
  &:last-child {
    padding-inline-end: 1rem;
  }
`;

const CellContentWrapper = styled.div`
  padding: 0.7rem;
  height: 100%;
  display: flex;
  align-items: center;

  tr:not(:last-child) & {
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  }
  td:first-child & {
    padding-inline-start: 0.2rem;
  }

  line-height: 1.5;
`;

// Flex does not support ellipsis so we need to have another container to handle the ellipsis
const CellContentContainer = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const HeaderCell = styled(Cell)`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  padding-block: 0.7rem;
  padding-inline: 0.7rem 0;
  display: flex;
  position: initial; // override this because we have 2 sticky header rows so we will apply sticky to the thead element
  background-color: ${({ theme }) => theme.palette.background.paper};
  .MuiTableSortLabel-icon {
    opacity: 0.5;
  }
  .MuiTableSortLabel-active .MuiTableSortLabel-icon {
    opacity: 1;
  }
`;

const CellLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  &:hover {
    tr:has(&) td {
      background-color: ${({ theme }) => `${theme.palette.primary.main}18`}; // 18 is 10% opacity
    }
  }
`;

const ColResize = styled.div.attrs({
  onClick: (e: React.DragEvent<HTMLDivElement>) => {
    // suppress other events when resizing
    e.preventDefault();
    e.stopPropagation();
  },
})`
  width: 2rem;
  height: 100%;
  cursor: col-resize;
`;

export interface HeaderDisplayCellProps {
  children?: ReactNode;
  canResize?: boolean;
  getResizerProps?: (props?: Partial<TableResizerProps>) => TableResizerProps;
  maxWidth?: number;
}

export const HeaderDisplayCell = ({
  children,
  canResize,
  getResizerProps = () => ({}),
  maxWidth,
  ...props
}: HeaderDisplayCellProps) => {
  return (
    <HeaderCell {...props} $maxWidth={maxWidth}>
      <CellContentContainer>{children}</CellContentContainer>
      {canResize && <ColResize {...getResizerProps()} />}
    </HeaderCell>
  );
};

interface TableCellProps {
  children: ReactNode;
  width?: string;
  row: Record<string, any>;
  maxWidth?: number;
  column?: Record<string, any>;
}
export const TableCell = ({ children, width, row, maxWidth, column, ...props }: TableCellProps) => {
  const getRowUrl = () => {
    if (!row) return {};
    if (row.url) return { to: row.url };
    if (column?.generateUrl) return column.generateUrl(row);
    return {};
  };
  const { to, state } = getRowUrl();
  return (
    <Cell {...props} $maxWidth={maxWidth}>
      <CellContentWrapper className="cell-content" as={to ? CellLink : 'div'} to={to} state={state}>
        <CellContentContainer>{children}</CellContentContainer>
      </CellContentWrapper>
    </Cell>
  );
};
