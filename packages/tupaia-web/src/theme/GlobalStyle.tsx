/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Theme } from '@material-ui/core';
import { createGlobalStyle } from 'styled-components';

/**
 * These are global styles used in the app. They are overrides that might not otherwise be possible to control at a component level, e.g. the datepicker dialog, as this actually appears outside of the component in the DOM
 */
export const GlobalStyle = createGlobalStyle<{
  theme: Theme;
}>` 
  #date-picker-dialog {
    .MuiSelect-root {
      color: ${({ theme }) => theme.palette.text.primary};
      &:focus {
        background-color: transparent;
      }
    }
    .MuiInputBase-root {
      background-color: transparent;
    }
  }
`;
