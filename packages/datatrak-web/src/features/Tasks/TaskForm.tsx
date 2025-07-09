import styled from 'styled-components';
import { Form } from '@tupaia/ui-components';

export const TaskForm = styled(Form)`
  .MuiFormLabel-root {
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    margin-block-end: 0.2rem;
    font-size: 0.875rem;
    &.Mui-disabled {
      color: initial;
    }
  }
  .MuiFormLabel-asterisk {
    color: ${({ theme }) => theme.palette.error.main};
  }
  .MuiInputBase-root {
    font-size: 0.875rem;
    &.Mui-disabled {
      background-color: ${({ theme }) => theme.palette.background.default};
    }
  }
  .MuiInputBase-input {
    padding-block: 0.9rem;
    &.Mui-disabled {
      background-color: transparent;
    }
  }
  .MuiInputBase-input::placeholder {
    color: ${({ theme }) => theme.palette.text.secondary};
    font-size: inherit;
  }
  .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.divider};
  }
  .MuiInputBase-root.Mui-error {
    background-color: transparent;
  }
`;
