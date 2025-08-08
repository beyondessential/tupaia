import styled from 'styled-components';
import MuiTable from '@material-ui/core/Table';

export const StyledTable = styled(MuiTable)`
  table-layout: fixed;

  // table head
  thead {
    text-transform: capitalize;

    th {
      font-weight: ${({ theme }) => (theme.palette.type === 'light' ? 400 : 500)};
      vertical-align: bottom;
    }
  }

  th,
  td {
    color: ${props => props.theme.palette.text.primary};
  }

  td.data-type-number {
    color: ${({ theme }) => (theme.palette.type === 'light' ? '#0f0f87' : 'white')};
  }

  td.data-type-boolean {
    color: #630000;
  }

  td.data-type-null {
    color: #8f8e8e;
    font-style: italic;
  }
`;
