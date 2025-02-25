import React, { HTMLAttributes } from 'react';
import { FieldValues, FormProvider, SubmitHandler, UseFormMethods } from 'react-hook-form';

interface FormProps<TFieldValues extends FieldValues>
  extends Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  formContext: UseFormMethods<TFieldValues>;
  onSubmit?: SubmitHandler<TFieldValues>;
}

/**
 * A wrapper around react-hook-form's FormProvider and form element. Needed for custom form fields
 * such as TextField and CheckboxField to be able to self register and validate with react-hook-form.
 */
export const Form = <TFieldValues extends FieldValues>({
  formContext,
  onSubmit,
  ...props
}: FormProps<TFieldValues>) => {
  return (
    <FormProvider {...formContext}>
      <form
        noValidate
        onSubmit={onSubmit ? formContext.handleSubmit(onSubmit) : undefined}
        {...props}
      />
    </FormProvider>
  );
};
