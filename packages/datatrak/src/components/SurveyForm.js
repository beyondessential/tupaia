/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useForm } from 'react-hook-form';
import React from 'react';
import styled from 'styled-components';
import { SurveyScreen } from './SurveyScreen';

const FormContainer = styled.div`
  margin-top: 2rem;
`;

export const SurveyForm = ({ surveyScreenComponents }) => {
  const { handleSubmit, register, errors } = useForm();

  const onSubmitSurvey = data => {
    console.log('submit survey data', data);
    alert(data);
  };

  return (
    <FormContainer>
      <form onSubmit={handleSubmit(onSubmitSurvey)} noValidate>
        {Object.entries(surveyScreenComponents).map(([screenNumber, surveyScreen]) => {
          return (
            <SurveyScreen
              key={screenNumber}
              screenNumber={screenNumber}
              surveyScreen={surveyScreen}
            />
          );
        })}
      </form>
    </FormContainer>
  );
};
