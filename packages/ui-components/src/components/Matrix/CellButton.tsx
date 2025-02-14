import { Button } from '@material-ui/core';
import styled from 'styled-components';

export const CellButton = styled(Button)`
  color: inherit;
  text-decoration: none;
  text-transform: none;
  font-size: inherit;
  text-align: left;
  .MuiTableCell-root:has(&) {
    padding: 0;
  }
`;
