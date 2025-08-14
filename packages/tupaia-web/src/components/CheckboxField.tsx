import React from 'react';
import { Checkbox } from '@tupaia/ui-components';
import { CheckboxProps as MuiCheckboxProps } from '@material-ui/core/Checkbox/Checkbox';
import styled from 'styled-components';
import { useFormContext } from 'react-hook-form';

const StyledCheckbox = styled(Checkbox)`
  display: flex;
  flex-direction: column;
  .MuiFormControlLabel-root {
    margin-right: 0;
  }
`;

interface CheckboxProps extends MuiCheckboxProps {
  options?: any; // options is type RegisterOptions from react-hook-form, but ts-lint can not find that export
  name: string;
  label?: React.ReactNode;
  helperText?: string | null;
}

export const CheckboxField = ({ name, label, required, options = {}, ...props }: CheckboxProps) => {
  const { register, errors = {} } = useFormContext();
  const requiredConfig = required ? { required: 'Required' } : {};
  const registerOptions = { ...options, ...requiredConfig };

  return (
    <StyledCheckbox
      name={name}
      label={label}
      required={required}
      color="primary"
      error={!!errors[name]}
      helperText={errors[name]?.message}
      inputRef={register(registerOptions) as any}
      {...props}
    />
  );
};
