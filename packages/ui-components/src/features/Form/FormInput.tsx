/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ComponentType } from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';

type HookFormInputWrapperProps = Record<string, unknown> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: RegisterOptions;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Input: ComponentType<any>;
  required?: boolean;
  type?: React.InputHTMLAttributes<unknown>['type'];
  validate?:
    | ((value: string) => boolean | string)
    | Record<string, (value: string) => boolean | string>;
};

export const FormInput = ({
  Input,
  name,
  options = {},
  required = false,
  type = 'text',
  validate,
  ...props
}: HookFormInputWrapperProps) => {
  const { register, errors = {} } = useFormContext();

  const requiredConfig = required ? { required: 'Required' } : {};

  const verifyIsNonwhitespace = (value: string) => !!value.trim() || 'Required';
  const shouldTrimToValidate = required && type !== 'password';
  const validateConfig =
    typeof validate === 'function'
      ? {
          validate: shouldTrimToValidate ? { validate, verifyIsNonwhitespace } : { validate },
        }
      : {
          validate: shouldTrimToValidate ? { ...validate, verifyIsNonwhitespace } : { ...validate },
        };

  const registerOptions = {
    ...requiredConfig,
    ...validateConfig,
    ...options,
  } as RegisterOptions;

  return (
    <Input
      name={name}
      required={!!required}
      error={!!errors[name]}
      helperText={errors[name]?.message}
      inputRef={register(registerOptions)}
      {...props}
    />
  );
};
