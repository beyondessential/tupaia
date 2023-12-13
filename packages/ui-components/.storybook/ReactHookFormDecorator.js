import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

const StorybookFormProvider = ({ children }) => {
  const formContext = useForm();
  return (
    <FormProvider {...formContext}>
      <form>{children}</form>
    </FormProvider>
  );
};

const ReactHookFormDecorator = (Story, context) => (
  <StorybookFormProvider>
    <Story {...context} />
  </StorybookFormProvider>
);

export default ReactHookFormDecorator;
