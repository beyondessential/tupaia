import React from 'react';
import styled from 'styled-components';
import { Button } from '../../../components';
import { SurveySuccess } from '../Components';
import { useSurveyForm } from '../SurveyContext';

const ButtonGroup = styled.div`
  max-width: 28rem;
  width: 100%;
`;

const DEV_ADMIN_PANEL_URL = 'https://dev-admin.tupaia.org';

export const SurveyResubmitSuccessScreen = () => {
  // The admin panel's survey-responses tab is project-scoped (lives under a
  // `/:projectCode` prefix), so return to the scoped route for this survey's
  // project rather than the all-data root (which lands on Data Elements).
  const { surveyProjectCode } = useSurveyForm();

  const getBaseAdminPanelUrl = () => {
    const { origin } = window.location;
    if (origin.includes('localhost')) return DEV_ADMIN_PANEL_URL;
    return origin.replace('datatrak', 'admin');
  };

  const projectPrefix = surveyProjectCode ? `/${surveyProjectCode}` : '';
  const adminPanelUrl = `${getBaseAdminPanelUrl()}${projectPrefix}/surveys/survey-responses`;
  return (
    <SurveySuccess
      text="You have successfully resubmitted the survey. To return to the admin panel click the button below"
      title="Survey resubmitted!"
    >
      <ButtonGroup>
        <Button href={adminPanelUrl} fullWidth component="a">
          Return to admin panel
        </Button>
      </ButtonGroup>
    </SurveySuccess>
  );
};
