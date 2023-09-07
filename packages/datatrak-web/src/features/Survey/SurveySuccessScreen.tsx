/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography, Button } from '@material-ui/core';
import { Description } from '@material-ui/icons';
import { useForm } from 'react-hook-form';
import { ButtonLink } from '../../components';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { useSurveyForm } from './SurveyContext.tsx';
import { ROUTES } from '../../constants';
import { useSurvey } from '../../api/queries';

const Toolbar = styled.div`
  height: 4.7rem;
  background: ${({ theme }) => theme.palette.background.paper};
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
  margin-left: -0.9375rem;
  margin-right: -0.9375rem;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
`;

const SurveyTitleWrapper = styled.div`
  padding: 1.3rem;
`;

const SurveyIcon = styled(Description).attrs({
  color: 'primary',
})`
  margin-right: 0.5rem;
`;

const SurveyTitle = styled(Typography).attrs({
  variant: 'h1',
})`
  display: flex;
  align-items: center;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
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
  const { surveyCode } = useParams();
  const params = useParams();
  const navigate = useNavigate();
  const { activeScreen, formData, setFormData } = useSurveyForm();
  const { reset } = useForm({ defaultValues: formData });
  const { data: survey } = useSurvey(surveyCode);

  const repeatSurvey = data => {
    setFormData(reset({ ...formData, ...data }));
    const path = generatePath(ROUTES.SURVEY_SCREEN, {
      ...params,
      screenNumber: String(activeScreen),
    });
    navigate(path);
  };

  return (
    <>
      <Toolbar>
        <SurveyTitleWrapper>
          {survey?.name && (
            <SurveyTitle>
              <SurveyIcon />
              {survey?.name}
            </SurveyTitle>
          )}
        </SurveyTitleWrapper>
      </Toolbar>
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
