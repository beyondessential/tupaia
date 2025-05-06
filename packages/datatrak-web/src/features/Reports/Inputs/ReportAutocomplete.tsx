import styled from 'styled-components';
import { Autocomplete } from '../../../components';

interface ReportAutocompleteOption {
  label: string;
  value: string;
}

export const ReportAutocomplete = styled(Autocomplete<ReportAutocompleteOption>)`
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
