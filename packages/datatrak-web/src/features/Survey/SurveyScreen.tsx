/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Button } from '@tupaia/ui-components';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { Typography, Button as MuiButton, Paper as MuiPaper } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { useNavigate, useParams, generatePath } from 'react-router-dom';
import { SurveyQuestion } from './SurveyQuestion';
import { useSurveyForm } from './SurveyContext';
import { ROUTES } from '../../constants';
import { SurveyParams } from '../../types';

const Container = styled.div`
  display: flex;
  justify-content: flex-start;
  padding-top: 2rem;
  padding-bottom: 2rem;
  flex: 1;
  overflow: hidden;
`;

const SideMenu = styled.div`
  background: rgba(0, 65, 103, 0.3);
  width: 500px;
  margin-right: 1rem;
`;

const Paper = styled(MuiPaper).attrs({
  variant: 'outlined',
  elevation: 0,
})`
  flex: 1;
  margin-left: 1rem;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ScreenHeading = styled(Typography)`
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 1rem;
`;

const FormScrollBody = styled.div`
  flex: 1;
  overflow: auto;
  padding: 3rem;
  margin-bottom: 0.5rem;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3rem;
  border-top: 1px solid #dfdfdf;

  button:last-child {
    margin-left: auto;
  }
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
      <SideMenu />
      <Paper>
        <StyledForm onSubmit={onStepForward} noValidate>
          <FormScrollBody>
            <ScreenHeading variant="h2">{surveyScreen[0].questionText}</ScreenHeading>
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
          </FormScrollBody>
          <FormActions>
            {screenNumber && screenNumber > 1 && (
              <MuiButton type="button" onClick={onStepPrevious} startIcon={<ArrowBackIosIcon />}>
                Back
              </MuiButton>
            )}
            <Button type="submit">Next</Button>
          </FormActions>
        </StyledForm>
      </Paper>
    </Container>
  );
};
