/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';
import { DARK_BLUE, ERROR, FORM_BLUE, WHITE } from './theme';

export const LightThemeProvider = styled.div`
  background: ${WHITE};
  padding-bottom: 20px;

  label,
  .MuiFormLabel-root,
  .MuiCheckbox-root,
  .MuiInput-underline::before {
    color: black;
    border-color: black;
  }

  .MuiInput-underline:hover:not(.Mui-disabled):before {
    border-bottom: 2px solid black;
  }

  .Mui-error {
    color: ${ERROR};
  }

  .Mui-focused {
    color: ${FORM_BLUE};
  }

  .MuiInputBase-input {
    color: ${DARK_BLUE};
  }

  button.MuiButtonBase-root {
    margin-top: 20px;
  }
`;
