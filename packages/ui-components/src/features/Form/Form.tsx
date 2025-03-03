import React, { HTMLAttributes } from 'react';
import { FormProvider, SubmitHandler } from 'react-hook-form';

interface FormProps extends HTMLAttributes<HTMLFormElement> {
  formContext: any;
  onSubmit?: SubmitHandler<any>;
}

/**
 * A wrapper around react-hook-form's FormProvider and form element. Needed for custom form fields
 * such as TextField and CheckboxField to be able to self register and validate with react-hook-form.
 */
export const Form = ({ formContext, onSubmit, ...props }: FormProps) => {
  return (
    <FormProvider {...formContext}>
      <form onSubmit={formContext.handleSubmit(onSubmit)} noValidate {...props} />
    </FormProvider>
  );
};
