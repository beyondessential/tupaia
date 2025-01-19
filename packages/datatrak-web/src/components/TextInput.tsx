import React from 'react';
import {
  FormControlLabel,
  FormControlLabelProps,
  FormLabel,
  TextField,
  TextFieldProps,
} from '@material-ui/core';
import styled from 'styled-components';

const LabelWrapper = styled(FormControlLabel)`
  align-items: flex-start;
  margin: 0;

  .MuiFormControlLabel-label {
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  }
  .MuiInput-root {
    font-size: 0.875rem;
  }
`;

interface TextInputProps
  extends Pick<FormControlLabelProps, 'label' | 'name' | 'onChange' | 'value'> {
  id?: string;
  required?: boolean;
  invalid?: boolean;
  ref?: React.Ref<HTMLInputElement>;
  textInputProps?: TextFieldProps & {
    min?: number;
    max?: number;
  };
}
export const TextInput = React.forwardRef<HTMLDivElement, TextInputProps>((props, ref) => {
  const { value, label, name, onChange, id, textInputProps, required, invalid } = props;
  return (
    <LabelWrapper
      label={
        <FormLabel required={required} error={invalid}>
          {label}
        </FormLabel>
      }
      name={name}
      inputRef={ref}
      labelPlacement={'top'}
      onChange={onChange}
      value={value}
      control={
        <TextField id={id} required={required} error={invalid} {...textInputProps} fullWidth />
      }
    />
  );
});
