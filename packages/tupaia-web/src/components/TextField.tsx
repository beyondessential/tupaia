import React from 'react';
import { useFormContext } from 'react-hook-form';
import MuiTextField, { TextFieldProps as MuiTextFieldProps } from '@material-ui/core/TextField';
import styled from 'styled-components';

const StyledTextField = styled(MuiTextField)<TextFieldProps>`
  display: flex;
  width: 100%;
  margin-bottom: 0.7rem;
  .MuiFormLabel-root.MuiInputLabel-root {
    color: ${({ theme }) => theme.palette.form.border};
    font-size: 0.875rem;
  }

  .MuiInputBase-root.MuiInput-root.MuiInput-underline.MuiInputBase-formControl.MuiInput-formControl {
    &:before,
    &:after {
      border-width: 1px;
    }
  }

  .MuiInputBase-input {
    color: white;
    font-size: 0.875rem;
    line-height: 1.3;
  }

  .MuiFormHelperText-root:not(.Mui-error) {
    color: ${({ theme }) => theme.palette.form.border};
  }
`;

type TextFieldProps = MuiTextFieldProps & {
  options?: any; // options is type RegisterOptions from react-hook-form, but ts-lint can not find that export
  name: string;
};
export const TextField = ({ name, label, required, options = {}, ...props }: TextFieldProps) => {
  const { register, errors = {} } = useFormContext();
  const requiredConfig = required ? { required: 'Required' } : {};
  const registerOptions = { ...options, ...requiredConfig };

  return (
    <StyledTextField
      name={name}
      label={label}
      required={required}
      error={!!errors[name]}
      helperText={errors[name]?.message}
      inputRef={register(registerOptions) as any}
      {...props}
    />
  );
};
