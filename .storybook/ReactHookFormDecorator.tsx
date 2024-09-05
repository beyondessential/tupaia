import React from 'react';
import { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Args } from '@storybook/react';
import { DecoratorFunction } from '@storybook/csf';

const StorybookFormProvider = ({ children }: { children: ReactNode }) => {
  const formContext = useForm();
  return (
    <FormProvider {...formContext}>
      <form>{children}</form>
    </FormProvider>
  );
};

const ReactHookFormDecorator: DecoratorFunction<any, Args> = (Story, context) => (
  <StorybookFormProvider>
    <Story {...context} />
  </StorybookFormProvider>
);

export default ReactHookFormDecorator;
