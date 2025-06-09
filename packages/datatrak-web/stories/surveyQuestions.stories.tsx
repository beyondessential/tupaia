import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { Meta, StoryObj } from '@storybook/react';
import styled from 'styled-components';
import { QuestionType } from '@tupaia/types';
import { SurveyQuestion } from '../src/features/Survey/Components';

const Form = styled.form`
  padding: 1rem;
  max-inline-size: 30rem;
`;

const meta: Meta<typeof SurveyQuestion> = {
  title: 'components/SurveyQuestion',
  component: SurveyQuestion,
  decorators: [
    Story => {
      const formContext = useForm();
      return (
        <FormProvider {...formContext}>
          <Form onSubmit={console.log}>
            <Story />
          </Form>
        </FormProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof SurveyQuestion>;

export const FreeText: Story = {
  render: () => (
    <SurveyQuestion
      id="firstName"
      name="firstName"
      label="First name"
      text="First name"
      type={QuestionType.FreeText}
    />
  ),
};
