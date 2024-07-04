import { TableCell } from '@material-ui/core';
import styled from 'styled-components';

export const Cell = styled(TableCell)`
  padding-inline: 0.2rem;
  padding-block: 0.4rem;
  border-color: ${({ theme }) => theme.palette.grey['400']};
  border-style: solid;
  border-width: 0 1px 1px 0;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  // TODO: fix this once we apply resizable columns
  max-width: 200px;
`;

export const HeaderCell = styled(Cell).attrs({
  component: 'th',
})`
  background-color: ${({ theme }) => theme.palette.secondary.main};
  border-color: white;
  border-style: solid;
`;

export const RowHeaderCell = styled(HeaderCell)`
  left: 0;
  position: sticky !important; // to override the position that is applied inline by react-table
  z-index: 2;
  thead & {
    top: 0;
    z-index: 4;
  }
`;
