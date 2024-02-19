/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { ComponentType } from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';

type HookFormInputWrapperProps = Record<string, unknown> & {
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

/**
 * A wrapper for `<input>` elements (and their abstractions, such as those from the MUI library)
 * that makes them self-registering for React Hook Form.
 *
 * @remarks Remember to explicitly set the `type` prop when `Input` is not some form of a text
 * field. It can takes the same values as the `type` attribute on vanilla HTML’s `<input>` element.
 * Otherwise, it defaults to `'text'`, and you will likely see unwanted behaviour (such as an
 * uncheckable checkbox).
 */
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

  const shouldTrimToValidate = required && type === 'text'; // Don’t trim passwords!
  const verifyIsNonwhitespace = (value: string) => !!value.trim() || 'Required';
  const validateConfig =
    typeof validate === 'function'
      ? // `validate` is a single function, so wrap it in an object of named functions where the
        // second function is `verifyIsNonwhitespace`
        {
          validate: shouldTrimToValidate ? { validate, verifyIsNonwhitespace } : { validate },
        }
      : // `validate` is an object of named functions, so simply add `verifyIsNonwhiteapce` to it
        {
          validate: shouldTrimToValidate ? { ...validate, verifyIsNonwhitespace } : { ...validate },
        };

  const registerOptions = {
    ...requiredConfig,
    ...validateConfig,
    ...options,
  } as RegisterOptions;

  return (
    <Input
      error={!!errors[name]}
      helperText={errors[name]?.message}
      inputRef={register(registerOptions)}
      name={name}
      required={!!required}
      type={type}
      {...props}
    />
  );
};
