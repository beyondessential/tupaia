/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate, useParams, generatePath } from 'react-router-dom';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Typography, Paper as MuiPaper } from '@material-ui/core';
import { SurveyQuestion } from './SurveyQuestion';
import { useSurveyForm } from './SurveyContext';
import { ROUTES } from '../../constants';
import { SurveyParams } from '../../types';
import { Button } from '../../components';
import { SurveySideMenu, SIDE_MENU_WIDTH } from './SurveySideMenu';

const Wrapper = styled.div`
  display: flex;
  margin-left: -1rem;
  padding-top: 2rem;
  padding-bottom: 2rem;
  overflow: hidden;
  flex: 1;
  align-items: flex-start;
`;

const Container = styled.div<{
  $sideMenuOpen?: boolean;
}>`
  display: flex;
  justify-content: flex-start;
  height: 100%;
  flex: 1;
  position: relative;
  padding: 0 1rem;
  margin-left: ${({ $sideMenuOpen }) => ($sideMenuOpen ? 0 : `-${SIDE_MENU_WIDTH}`)};
  transition: margin 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms;
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

const QuestionNumber = styled(Typography)`
  width: 3.5rem;
  text-transform: lowercase;
`;

const ButtonGroup = styled.div`
  display: flex;
  button,
  a {
    &:last-child {
      margin-left: 1rem;
    }
  }
`;

export const SurveyScreen = () => {
  const navigate = useNavigate();
  const params = useParams<SurveyParams>();
  const {
    setFormData,
    formData,
    isLast,
    displayQuestions,
    screenHeader,
    screenNumber,
    sideMenuOpen,
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
    <FormProvider {...formContext}>
      <Wrapper>
        <SurveySideMenu />
        <Container $sideMenuOpen={sideMenuOpen}>
          <Paper>
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
                    questionOptionSetId,
                    questionNumber,
                  }) => {
                    if (validationCriteria?.mandatory === true) {
                      console.log('mandatory question', questionCode);
                    }
                    return (
                      <QuestionWrapper
                        key={questionId}
                        $isInstruction={questionType === 'Instruction'}
                      >
                        {questionNumber && (
                          <QuestionNumber id={`question_number_${questionId}`}>
                            {questionNumber}
                          </QuestionNumber>
                        )}
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
                          optionSetId={questionOptionSetId}
                        />
                      </QuestionWrapper>
                    );
                  },
                )}
              </FormScrollBody>
              <FormActions>
                <Button
                  onClick={onStepPrevious}
                  startIcon={<ArrowBackIosIcon />}
                  variant="text"
                  color="default"
                >
                  Back
                </Button>
                <ButtonGroup>
                  <Button variant="outlined" to={ROUTES.SURVEY_SELECT}>
                    Cancel
                  </Button>
                  <Button type="submit">Next</Button>
                </ButtonGroup>
              </FormActions>
            </StyledForm>
          </Paper>
        </Container>
      </Wrapper>
    </FormProvider>
  );
};
