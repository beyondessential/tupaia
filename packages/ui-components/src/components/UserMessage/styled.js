import styled from 'styled-components';

import { Button, Card, CardHeader, Divider, TextareaAutosize } from '@material-ui/core';

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

export const StyledTextareaAutosize = styled(TextareaAutosize)`
  width: 100%;
  border: 0;
  padding: 0;
  height: 50px !important;
  margin-bottom: 1em;
`;

export const StyledButton = styled(Button)`
  position: relative;
  top: 0.8em;
  margin-right: 1em;
`;

export const StyledDivider = styled(Divider)`
  margin: 0 -5%;
`;
