/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Typography, Paper as MuiPaper, Button as MuiButton } from '@material-ui/core';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate, useParams, generatePath } from 'react-router-dom';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Button } from '@tupaia/ui-components';
import { SurveyQuestion } from './SurveyQuestion';
import { useSurveyForm } from './SurveyContext';
import { ROUTES, MOBILE_BREAKPOINT } from '../../constants';
import { SurveyParams } from '../../types';

const Container = styled.div`
  display: flex;
  justify-content: flex-start;
  padding-top: 2rem;
  padding-bottom: 2rem;
  flex: 1;
  overflow: hidden;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    overflow: auto;
    flex-direction: column;
  }
`;

const SideMenu = styled.div`
  background: rgba(0, 65, 103, 0.3);
  width: 30rem;
  margin-right: 1rem;
  max-width: 100%;
`;

const Paper = styled(MuiPaper).attrs({
  variant: 'outlined',
  elevation: 0,
})`
  flex: 1;
  margin-left: 1rem;
  padding: 0;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ScreenHeading = styled(Typography)`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;

const FormScrollBody = styled.div`
  flex: 1;
  overflow: auto;
  padding: 2rem;
  margin-bottom: 0.5rem;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid ${props => props.theme.palette.divider};

  button:last-child {
    margin-left: auto;
  }
`;

const QuestionWrapper = styled.div<{
  $isInstruction: boolean;
}>`
  display: flex;
  &:not(:last-child) {
    margin-bottom: ${({ $isInstruction }) => ($isInstruction ? '1rem' : '2rem')};
  }
`;

export const SurveyScreen = () => {
  const navigate = useNavigate();
  const params = useParams<SurveyParams>();
  const {
    setFormData,
    formData,
    isLast,
    screenNumber,
    displayQuestions,
    screenHeader,
  } = useSurveyForm();
  const formContext = useForm({ defaultValues: formData });
  const { handleSubmit } = formContext;

  const handleStep = (path, data) => {
    setFormData({ ...formData, ...data });
    navigate(path);
  };

  const onStepPrevious = handleSubmit(data => {
    const path =
      screenNumber === 1
        ? ROUTES.SURVEY_SELECT
        : generatePath(ROUTES.SURVEY_SCREEN, {
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
      <SideMenu />
      <Paper>
        <FormProvider {...formContext}>
          <StyledForm onSubmit={onStepForward} noValidate>
            <FormScrollBody>
              <ScreenHeading variant="h2">{screenHeader}</ScreenHeading>
              {displayQuestions.map(
                ({
                  questionId,
                  questionCode,
                  questionText,
                  questionType,
                  questionOptions,
                  config,
                  questionLabel,
                  validationCriteria,
                  detailLabel,
                }) => {
                  if (validationCriteria?.mandatory === true) {
                    console.log('mandatory question', questionCode);
                  }
                  return (
                    <QuestionWrapper
                      key={questionId}
                      $isInstruction={questionType === 'Instruction'}
                    >
                      <SurveyQuestion
                        detailLabel={detailLabel}
                        id={questionId}
                        code={questionCode}
                        name={questionCode}
                        type={questionType}
                        text={detailLabel || questionText}
                        options={questionOptions}
                        config={config}
                        label={questionLabel || questionText}
                      />
                    </QuestionWrapper>
                  );
                },
              )}
            </FormScrollBody>
            <FormActions>
              <MuiButton type="button" onClick={onStepPrevious} startIcon={<ArrowBackIosIcon />}>
                Back
              </MuiButton>
              <Button type="submit">Next</Button>
            </FormActions>
          </StyledForm>
        </FormProvider>
      </Paper>
    </Container>
  );
};
