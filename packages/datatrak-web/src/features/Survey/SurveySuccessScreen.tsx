/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Button as BaseButton } from '../../components';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { useSurveyForm } from './SurveyContext.tsx';
import { ROUTES } from '../../constants';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  flex: 1;
`;

const StyledImg = styled.img`
  max-width: 80%;
  max-height: 50%;
  margin-bottom: 2.75rem;
`;

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1.9rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1.19rem;
`;

const Text = styled(Typography)`
  max-width: 34.6rem;
  width: 100%;
  text-align: center;
  margin-bottom: 1.875rem;
`;

const ButtonGroup = styled.div`
  max-width: 28rem;
  width: 100%;
`;

const Button = styled(BaseButton)`
  & + & {
    margin: 1.25rem 0 0 0;
  }
`;

export const SurveySuccessScreen = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { resetForm } = useSurveyForm();

  const repeatSurvey = () => {
    resetForm();
    const path = generatePath(ROUTES.SURVEY_SCREEN, {
      ...params,
      screenNumber: '1',
    });
    navigate(path);
  };

  return (
    <Wrapper>
      <StyledImg src="/submit-success.svg" alt="Survey submit success" />
      <Title>Survey submitted!</Title>
      <Text>
        To repeat the same survey again click the button below, otherwise 'Close' to return back to
        your dashboard
      </Text>
      <ButtonGroup>
        <Button onClick={repeatSurvey} fullWidth variant="outlined">
          Repeat Survey
        </Button>
        <Button to="/" fullWidth>
          Close
        </Button>
      </ButtonGroup>
    </Wrapper>
  );
};
