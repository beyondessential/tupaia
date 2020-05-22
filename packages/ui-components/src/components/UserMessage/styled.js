import styled from 'styled-components';

import { Card, CardHeader } from '@material-ui/core';

export const StyledCard = styled(Card)`
  max-width: 460px;

  .MuiCardHeader-root {
    padding: 8px 16px;
    border-width: 0 0 1px 0;
    border-style: solid;
    border-color: #dedee0;
  }
`;

export const StyledCardHeader = styled(CardHeader)`
  .MuiCardHeader-action {
    flex: 1 1 auto;
    align-self: center;
    margin-top: 0;
  }
`;
