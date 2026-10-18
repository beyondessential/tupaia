import React from 'react';
import { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { Args, Decorator } from '@storybook/react-vite';

const StorybookFormProvider = ({ children }: { children: ReactNode }) => {
  const formContext = useForm();
  return (
    <FormProvider {...formContext}>
      <form>{children}</form>
    </FormProvider>
  );
};

const ReactHookFormDecorator: Decorator<Args> = (Story, context) => (
  <StorybookFormProvider>
    <Story {...context} />
  </StorybookFormProvider>
);

export default ReactHookFormDecorator;
