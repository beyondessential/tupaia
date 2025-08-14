import React from 'react';
import styled from 'styled-components';
import { MultiValueRowViewConfig, ViewConfig, ViewDataItem, ViewReport } from '@tupaia/types';
import {
  Table,
  TableCell as MuiTableCell,
  TableRow,
  TableBody,
  TableHead,
} from '@material-ui/core';

interface MultiValueRowProps {
  report: ViewReport;
  config: ViewConfig;
  isExport?: boolean;
}

const StyledTable = styled(Table)<{
  $isExport?: boolean;
}>`
  th.MuiTableCell-root,
  td.MuiTableCell-root {
    ${props => props.$isExport && 'color: currentColor;'}
  }
  border: none;
`;

const Row = styled(TableRow)`
  background-color: transparent;
  &:nth-child(even) {
    background-color: transparent;
  }
`;

const TableCell = styled(MuiTableCell)`
  border: none;
  padding: 0.375rem 0;
  font-size: 1rem;
  line-height: 1.2;
  &:not(:first-child) {
    text-align: right;
  }
`;

const TableHeaderCell = styled(TableCell)`
  font-weight: normal;
  text-decoration: underline;
`;

export const MultiValueRow = ({ report: { data }, config, isExport }: MultiValueRowProps) => {
  const { presentationOptions } = (config || {}) as MultiValueRowViewConfig;
  const { leftColumn, middleColumn, rightColumn, rowHeader } = presentationOptions || {};

  const headerCells = [leftColumn, middleColumn, rightColumn].filter(item => item);
  const showTableHeader = headerCells.length > 0 || rowHeader;

  return (
    <StyledTable $isExport={isExport}>
      {showTableHeader && (
        <TableHead>
          <Row>
            {rowHeader && <TableHeaderCell>{rowHeader?.name}</TableHeaderCell>}
            {headerCells.map(cell => (
              <TableHeaderCell key={`header-${cell?.header}`}>{cell?.header}</TableHeaderCell>
            ))}
          </Row>
        </TableHead>
      )}
      <TableBody>
        {data?.map((datum: ViewDataItem, i) => (
          <Row key={datum.name}>
            <TableCell>{datum.name}</TableCell>
            {headerCells.map(cell => (
              <TableCell key={`row-${i}-cell-${cell?.header}`}>
                {datum[cell?.header as string]}
              </TableCell>
            ))}
          </Row>
        ))}
      </TableBody>
    </StyledTable>
  );
};
