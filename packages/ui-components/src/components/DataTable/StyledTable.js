/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import styled from 'styled-components';
import MuiTable from '@material-ui/core/Table';

const DARK_THEME_BORDER = 'rgb(82, 82, 88)';

export const StyledTable = styled(MuiTable)`
  table-layout: fixed;
  overflow: hidden;
  border: 1px solid ${({ theme }) => (theme.palette.type === 'light' ? 'none' : DARK_THEME_BORDER)};

  // table head
  thead {
    text-transform: capitalize;
    border-bottom: 1px solid
      ${({ theme }) => (theme.palette.type === 'light' ? theme.palette.grey['400'] : 'none')};
    background: ${({ theme }) => (theme.palette.type === 'light' ? 'none' : '#3e3f4a')};

    tr {
      background: none;
    }

    th {
      position: relative;
      border: none;
      font-weight: ${({ theme }) => (theme.palette.type === 'light' ? 400 : 500)};
      vertical-align: bottom;
    }
  }

  // table body
  tbody {
    tr {
      &:nth-of-type(odd) {
        background: ${({ theme }) =>
          theme.palette.type === 'light' ? theme.palette.grey['100'] : 'none'};
      }
      &:last-child th,
      &:last-child td {
        border-bottom: none;
      }
    }
  }

  th,
  td {
    padding-top: 1.125rem;
    padding-bottom: 1.125rem;
    color: ${props => props.theme.palette.text.primary};
    border-right: 1px solid
      ${({ theme }) =>
        theme.palette.type === 'light' ? theme.palette.grey['400'] : DARK_THEME_BORDER};

    &:last-child {
      border-right: none;
    }
  }
`;
