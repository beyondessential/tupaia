import styled from 'styled-components';
import MuiPaper from '@material-ui/core/Paper';
import { Autocomplete as AutocompleteComponent } from '@tupaia/ui-components';

const PaperComponent = styled(MuiPaper)`
  .MuiAutocomplete-option {
    font-size: 14px;
  }
`;

export const Autocomplete = styled(AutocompleteComponent).attrs({
  PaperComponent,
})`
  flex: 1 1 0px;
  margin: 0 15px 0 0;
  max-width: 30%;

  input.MuiInputBase-input.MuiOutlinedInput-input.MuiAutocomplete-input {
    font-size: 14px;
    line-height: 1;
    padding: 10px;
  }

  .MuiFormControl-root {
    margin: 0;
  }
`;
