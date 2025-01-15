import React from 'react';
import { FormProvider, SubmitHandler } from 'react-hook-form';

interface FormProps {
  formContext: any;
  onSubmit?: SubmitHandler<any>;
  children: React.ReactNode;
  className?: string;
}

/**
 * A wrapper around react-hook-form's FormProvider and form element. Needed for custom form fields
 * such as TextField and CheckboxField to be able to self register and validate with react-hook-form.
 */
export const Form = ({ formContext, onSubmit, children, className }: FormProps) => {
  return (
    <FormProvider {...formContext}>
      <form className={className} onSubmit={formContext.handleSubmit(onSubmit)} noValidate>
        {children}
      </form>
    </FormProvider>
  );
};
