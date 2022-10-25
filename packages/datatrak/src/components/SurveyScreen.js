/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Button } from '@tupaia/ui-components';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { useHistory, useParams, generatePath } from 'react-router-dom';
import { SurveyQuestion } from './SurveyQuestion';
import { useSurveyForm } from '../SurveyFormContext';

const Container = styled.div`
  // nothing?
`;

export const SurveyScreen = ({ surveyScreen, isLast }) => {
  const { register, handleSubmit } = useForm();
  const { setFormData, formData } = useSurveyForm();
  const { push } = useHistory();
  let params = useParams();

  const onSubmitStep = screenData => {
    let path;
    if (isLast) {
      path = generatePath('/:projectId/:countryId/:surveyId/submit', params);
    } else {
      path = generatePath('/:projectId/:countryId/:surveyId/screen/:screenNumber', {
        ...params,
        screenNumber: parseInt(params.screenNumber, 10) + 1,
      });
    }

    console.log('submit survey data', { ...formData, ...screenData });
    setFormData({ ...formData, ...screenData });
    push(path);

    // alert(JSON.stringify(data));
  };

  return (
    <Container>
      <form onSubmit={handleSubmit(onSubmitStep)} noValidate>
        {surveyScreen.map(question => {
          return (
            <SurveyQuestion
              key={question.questionId}
              register={register}
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
        <Button type="submit">Next</Button>
      </form>
    </Container>
  );
};
