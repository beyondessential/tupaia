/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';
import { Autocomplete as BaseAutocomplete } from '../../../components';

export const Autocomplete = styled(BaseAutocomplete)`
  margin: 0;
  .MuiAutocomplete-input {
    font-size: 0.875rem;
  }
  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
  .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.divider};
  }
`;
