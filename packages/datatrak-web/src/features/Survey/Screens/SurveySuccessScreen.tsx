import React from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button as BaseButton } from '../../../components';
import { useSurveyForm } from '../SurveyContext';
import { ROUTES } from '../../../constants';
import { useSurvey } from '../../../api/queries';
import { SurveySuccess } from '../Components';

const ButtonGroup = styled.div`
  max-width: 28rem;
  width: 100%;
`;

const Button = styled(BaseButton)`
  text-align: center;

  & + & {
    margin-block: 1.25rem 0;
    margin-inline: 0;
  }

  &.MuiButton-outlined {
    ${({ theme }) => theme.breakpoints.down('sm')} {
      background: white;
    }
  }

  &.MuiButton-outlined {
    ${({ theme }) => theme.breakpoints.down('sm')} {
      background: white;
    }
  }
`;

const returnButton = (
  <Button to="/" fullWidth>
    Return to dashboard
  </Button>
);

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
      return 'To repeat the same survey again click the button below, otherwise return to your dashboard';
    }

    return 'To return to your dashboard, click the button below';
  };

  const text = getText();

  return (
    <SurveySuccess text={text} title="Survey submitted!">
      <ButtonGroup>
        {survey?.canRepeat && (
          <Button onClick={repeatSurvey} fullWidth variant="outlined">
            Repeat survey
          </Button>
        )}
        {returnButton}
      </ButtonGroup>
    </SurveySuccess>
  );
};
