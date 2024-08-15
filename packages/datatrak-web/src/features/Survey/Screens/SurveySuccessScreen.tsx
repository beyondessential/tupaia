/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button as BaseButton } from '../../../components';
import { useSurveyForm } from '../SurveyContext';
import { ROUTES } from '../../../constants';
import { useSurvey } from '../../../api/queries';
import { useFromLocation } from '../../../utils';
import { SurveySuccess } from '../Components';

const ButtonGroup = styled.div`
  max-width: 28rem;
  width: 100%;
`;

const Button = styled(BaseButton)`
  & + & {
    margin: 1.25rem 0 0 0;
  }
`;

const ReturnButton = () => {
  const from = useFromLocation();
  return from === ROUTES.TASKS ? (
    <Button to={ROUTES.TASKS} fullWidth>
      Return to tasks
    </Button>
  ) : (
    <Button to="/" fullWidth>
      Return to dashboard
    </Button>
  );
};

export const SurveySuccessScreen = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { resetForm } = useSurveyForm();
  const { data: survey } = useSurvey(params.surveyCode);
  const repeatSurvey = () => {
    resetForm();
    const path = generatePath(ROUTES.SURVEY_SCREEN, {
      ...params,
      screenNumber: '1',
    });
    navigate(path);
  };

  const getText = () => {
    if (survey?.canRepeat) {
      return "To repeat the same survey again click the button below, otherwise 'Close' to return to your dashboard";
    }

    return 'To return to your dashboard, click the button below';
  };

  const text = getText();

  return (
    <SurveySuccess text={text} title="Survey submitted!" showQrCode>
      <ButtonGroup>
        {survey?.canRepeat && (
          <Button onClick={repeatSurvey} fullWidth variant="outlined">
            Repeat Survey
          </Button>
        )}
        <ReturnButton />
      </ButtonGroup>
    </SurveySuccess>
  );
};
