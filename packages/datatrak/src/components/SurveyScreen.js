/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useForm } from 'react-hook-form';
import { SurveyQuestion } from './SurveyQuestion';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-top: 2rem;
`;

export const SurveyScreen = ({ screenNumber, surveyScreen }) => {
  console.log('surveyScreen', surveyScreen);
  return (
    <Container>
      <p>Screen {screenNumber}</p>
      {surveyScreen.map(question => {
        return (
          <SurveyQuestion
            key={question.questionId}
            id={question.questionId}
            code={question.questionCode}
            name={question.questionName}
            type={question.questionType}
            text={question.questionText}
            options={question.questionOptions}
            config={question.config}
            label={question.questionLabel || question.questionName}
          />
        );
      })}
    </Container>
  );
};
