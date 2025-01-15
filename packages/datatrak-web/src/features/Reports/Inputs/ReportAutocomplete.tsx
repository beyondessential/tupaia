import styled from 'styled-components';
import { Autocomplete } from '../../../components';

export const ReportAutocomplete = styled(Autocomplete)`
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
