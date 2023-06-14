/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { FormProvider, SubmitHandler } from 'react-hook-form';

interface FormProps {
  formContext: any;
  onSubmit: SubmitHandler<any>;
  children: React.ReactNode;
  className?: string;
}

export const Form = ({ formContext, onSubmit, children, className }: FormProps) => {
  return (
    <FormProvider {...formContext}>
      <form className={className} onSubmit={formContext.handleSubmit(onSubmit)} noValidate>
        {children}
      </form>
    </FormProvider>
  );
};
