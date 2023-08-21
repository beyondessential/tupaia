/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ComponentType } from 'react';
import { useFormContext } from 'react-hook-form';

type HookFormInputWrapperProps = Record<string, unknown> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any; // options is type RegisterOptions from react-hook-form, but ts-lint can not find that export
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Input: ComponentType<any>;
  required?: boolean;
};
export const HookFormInput = ({
  name,
  required,
  options = {},
  Input,
  ...props
}: HookFormInputWrapperProps) => {
  const { register, errors = {} } = useFormContext();
  const requiredConfig = required ? { required: 'Required' } : {};
  const registerOptions = { ...options, ...requiredConfig };

  return (
    <Input
      name={name}
      required={!!required}
      error={!!errors[name]}
      helperText={errors[name]?.message}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      inputRef={register(registerOptions) as any}
      {...props}
    />
  );
};
