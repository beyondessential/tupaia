import styled from 'styled-components';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';

export const AuthFormTextField = styled(TextField)<TextFieldProps>`
  display: flex;
  width: 100%;
  margin-bottom: 0.7rem;

  .MuiFormLabel-root.MuiInputLabel-root {
    color: ${({ theme }) => theme.palette.text.secondary};
    font-size: 0.875rem;
  }

  .MuiInputBase-root.MuiInput-root.MuiInput-underline.MuiInputBase-formControl.MuiInput-formControl {
    &:before,
    &:after {
      border-width: 1px;
    }
  }

  .MuiInputBase-input {
    color: ${({ theme }) => theme.palette.text.primary};
    font-size: 0.875rem;
    line-height: 1.3;
  }

  .MuiFormHelperText-root:not(.Mui-error) {
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;
