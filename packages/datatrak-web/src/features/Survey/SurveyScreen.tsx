/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Button } from '@tupaia/ui-components';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { useNavigate, useParams, generatePath } from 'react-router-dom';
import { SurveyQuestion } from './SurveyQuestion';
import { useSurveyForm } from './SurveyContext';
import { ROUTES } from '../../constants';
import { SurveyParams } from '../../types';

const Container = styled.div`
  margin-top: 3rem;
  margin-bottom: 3rem;
  padding: 3rem;
  background: white;
  max-width: 60rem;
  border-radius: 3px;
  border: 1px solid #dfdfdf;
`;

// Example http://localhost:5173/explore/TO/BCD_DL/1
export const SurveyScreen = ({ surveyScreen, isLast }) => {
  const { setFormData, formData } = useSurveyForm();
  const navigate = useNavigate();
  const params = useParams<SurveyParams>();
  const screenNumber = parseInt(params.screenNumber!, 10);

  const { register, handleSubmit } = useForm({ defaultValues: formData });
  const handleStep = (path, data) => {
    setFormData({ ...formData, ...data });
    navigate(path);
  };

  const onStepPrevious = handleSubmit(data => {
    const path = generatePath(ROUTES.SURVEY_SCREEN, {
      ...params,
      screenNumber: String(screenNumber - 1),
    });
    handleStep(path, data);
  });

  const onStepForward = handleSubmit(data => {
    const path = isLast
      ? generatePath(ROUTES.SURVEY_REVIEW, params)
      : generatePath(ROUTES.SURVEY_SCREEN, {
          ...params,
          screenNumber: String(screenNumber + 1),
        });

    handleStep(path, data);
  });

  return (
    <Container>
      <h2>Question {screenNumber}</h2>
      <form onSubmit={onStepForward} noValidate>
        {surveyScreen.map(
          ({
            questionId,
            questionCode,
            questionText,
            questionType,
            questionOptions,
            config,
            questionName,
            questionLabel,
            validationCriteria,
          }) => {
            if (validationCriteria?.mandatory === true) {
              console.log('mandatory question', questionCode);
            }
            return (
              <SurveyQuestion
                register={register}
                key={questionId}
                id={questionId}
                code={questionCode}
                name={questionCode}
                type={questionType}
                text={questionText}
                options={questionOptions}
                config={config}
                label={questionLabel || questionName}
              />
            );
          },
        )}
        {screenNumber && screenNumber > 1 && (
          <Button type="button" onClick={onStepPrevious}>
            Back
          </Button>
        )}
        <Button type="submit">Next</Button>
      </form>
    </Container>
  );
};
