/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Table, TableBody } from '@material-ui/core';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { MatrixHeaderRow } from './MatrixHeaderRow';
import { Button } from '../Button';
import { MatrixRow } from './MatrixRow';
import { MatrixColumnType, MatrixRowType } from '../../types';
import { hexToRgba } from './utils';

export const MINIMUM_CELL_WIDTH = 55;
export const MAXIMUM_CELL_WIDTH = 200;
export const LABEL_WIDTH = 195;
export const DESCRIPTION_CELL_WIDTH = 300;
export const CATEGORY_INDENT = 20;
export const CELL_WIDTH_PER_CHARACTER = 10;

const MatrixTable = styled.table`
  overflow: hidden;
  height: 100%; // this is so the modal button for the cell fills the whole height of the cell
  border: 1px solid ${({ theme }) => hexToRgba(theme.palette.text.primary, 0.2)};
  color: ${({ theme }) => theme.palette.text.primary};
  td,
  th {
    border: 1px solid ${({ theme }) => hexToRgba(theme.palette.text.primary, 0.2)};
  }
`;

const TableMoveButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const TableMoveButton = styled(Button)`
  text-transform: none;
  font-size: 0.875rem;
  background-color: transparent;
  border-color: transparent;
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  color: ${({ theme }) => theme.palette.text.primary};
  padding: 0;
  &:disabled {
    background-color: transparent;
    opacity: 0.6;
  }
  &:hover,
  &:focus {
    background-color: transparent;
    box-shadow: none;
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const Wrapper = styled.div``;
interface MatrixProps {
  columns: MatrixColumnType[];
  rows: MatrixRowType[];
  presentationOptions: any;
  maximumCellCharacters?: number;
  onUpdateSearch?: (search: string) => void;
  searchTerm?: string;
}

export const Matrix = ({
  columns = [],
  rows = [],
  maximumCellCharacters = 0,
  presentationOptions,
}: MatrixProps) => {
  const [startColumn, setStartColumn] = useState(0);
  const [numberOfColumnsPerPage, setNumberOfColumnsPerPage] = useState(0);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const tableEl = useRef<HTMLTableElement | null>(null);

  const maximumColumnWidth = Math.min(
    MAXIMUM_CELL_WIDTH,
    Math.max(MINIMUM_CELL_WIDTH, maximumCellCharacters * CELL_WIDTH_PER_CHARACTER),
  );

  useEffect(() => {
    // Update the number of columns per page when the table width changes, e.g. the table is resized. Mostly important for onmount
    const updateNumberOfColumnsPerPage = () => {
      if (!tableEl || !tableEl?.current || !tableEl?.current?.offsetWidth) return;
      const { offsetWidth } = tableEl?.current;
      const safeWidth = offsetWidth - 50; // Compensate for angled labels.
      const usableWidth = safeWidth - DESCRIPTION_CELL_WIDTH - MINIMUM_CELL_WIDTH * 2;
      const maxColumns = Math.floor(usableWidth / maximumColumnWidth);
      setNumberOfColumnsPerPage(maxColumns);
    };

    updateNumberOfColumnsPerPage();
  }, [tableEl?.current?.offsetWidth]);

  // Show the previous button when the first column is not visible
  const showButtons = columns.length > numberOfColumnsPerPage;

  // Only show the columns that are within the range of start/end columns
  const displayedColumns = columns.slice(startColumn, startColumn + numberOfColumnsPerPage);

  const handleMoveColumnLeft = () => {
    setStartColumn(startColumn - 1);
  };

  const handleMoveColumnRight = () => {
    setStartColumn(startColumn + 1);
  };

  const toggleExpandedRows = (category: string) => {
    const isExpanded = expandedRows.includes(category);
    setExpandedRows(
      isExpanded ? expandedRows.filter(row => row !== category) : [...expandedRows, category],
    );
  };
  return (
    <Wrapper>
      {showButtons && (
        <TableMoveButtonWrapper>
          <TableMoveButton
            disabled={startColumn === 0}
            color="default"
            onClick={handleMoveColumnLeft}
            title="Show previous columns"
          >
            <KeyboardArrowLeft />
            Previous
          </TableMoveButton>
          <TableMoveButton
            disabled={startColumn >= columns.length - numberOfColumnsPerPage}
            color="default"
            onClick={handleMoveColumnRight}
            title="Show next columns"
          >
            Next
            <KeyboardArrowRight />
          </TableMoveButton>
        </TableMoveButtonWrapper>
      )}

      <Table component={MatrixTable} ref={tableEl}>
        <MatrixHeaderRow columns={displayedColumns} />
        <TableBody>
          {rows.map(row => (
            <MatrixRow
              key={row.title}
              row={row}
              displayedColumns={displayedColumns}
              expanded={expandedRows}
              toggleExpanded={toggleExpandedRows}
              presentationOptions={presentationOptions}
              parents={[]}
            />
          ))}
        </TableBody>
      </Table>
    </Wrapper>
  );
};
