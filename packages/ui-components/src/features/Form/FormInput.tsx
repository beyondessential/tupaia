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
  required?: boolean | 'non-whitespace';
  // nonWhitespace?: boolean;
  validate?:
    | ((value: string) => boolean | string)
    | Record<string, (value: string) => boolean | string>;
};
export const FormInput = ({
  name,
  required,
  // nonWhitespace,
  validate,
  options = {},
  Input,
  ...props
}: HookFormInputWrapperProps) => {
  const { register, errors = {} } = useFormContext();

  const requiredConfig = required ? { required: 'Required' } : {};

  const verifyIsNonwhitespace = (value: string) => !!value.trim() || 'Required';

  // prettier-ignore
  const validateConfig =
    typeof validate === 'function'
      ? {
          validate: required === 'non-whitespace'
            ? { validate, verifyIsNonwhitespace }
            : { validate },
        }
      : {
          validate: required === 'non-whitespace'
            ? { ...validate, verifyIsNonwhitespace }
            : { ...validate },
        };

  const registerOptions = {
    ...requiredConfig,
    ...validateConfig,
    ...options,
  };

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
