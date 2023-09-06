/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Typography, Button } from '@material-ui/core';
import { useForm } from 'react-hook-form';
import { ButtonLink } from '../../components';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { useSurveyForm } from './SurveyContext.tsx';
import { ROUTES } from '../../constants';
import { FormatShapesTwoTone } from '@material-ui/icons';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 7.3rem;
`;

const StyledImg = styled.img`
  width: 21.4rem;
  height: 21.4rem;
  margin-bottom: 2.75rem;
`;

const SurveySubmit = styled(Typography).attrs({
  color: 'textPrimary',
})`
  font-size: 1.9rem;
  font-weight: 600;
  margin-bottom: 1.19rem;
`;

const SubmissionText = styled(Typography).attrs({
  color: 'textPrimary',
})`
  width: 34.6rem;
  text-align: center;
  margin-bottom: 1.875rem;
`;

const RepeatSurvey = styled(Button).attrs({
  variant: 'outlined',
  color: 'primary',
})`
  padding: 0.875rem 11rem;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 1.25rem;
`;

const CloseBtn = styled(ButtonLink).attrs({
  variant: 'contained',
  color: 'primary',
})`
  padding: 0.875rem 13rem;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;
export const SurveySuccessScreen = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { activeScreen, formData, setFormData } = useSurveyForm();
  const { reset} = useForm({defaultValues: formData})
  
  const repeatSurvey = (data) => {
    setFormData(reset({ ...formData, ...data }));
    const path = generatePath(ROUTES.SURVEY_SCREEN, {
      ...params,
      screenNumber: String(activeScreen), 
    });
    navigate(path)
};
      // useEffect(() => {
      //   if(formState.isSubmitSuccessful) {
      //     reset({formData})
      //   }
      // }, [formState, reset]) 

  return (
    <>
    <Wrapper>
      <StyledImg src="/submit-success.svg" alt="submit-success" />
      <SurveySubmit variant="h1">Survey submitted!</SurveySubmit>
      <SubmissionText>
        To repeat the same survey again click the button below otherwise ‘Close’ to return back to
        your dashboard
      </SubmissionText>
      <RepeatSurvey onClick={repeatSurvey}>Repeat Survey</RepeatSurvey>
      <CloseBtn to="/">Close</CloseBtn>
    </Wrapper>
    </>
  );
};
