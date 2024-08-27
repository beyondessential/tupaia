/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Button } from '../../../components';
import { SurveySuccess } from '../Components';

const ButtonGroup = styled.div`
  max-width: 28rem;
  width: 100%;
`;

const DEV_ADMIN_PANEL_URL = 'https://dev-admin.tupaia.org';

export const SurveyResubmitSuccessScreen = () => {
  const getBaseAdminPanelUrl = () => {
    const { origin } = window.location;
    if (origin.includes('localhost')) return DEV_ADMIN_PANEL_URL;
    return origin.replace('datatrak', 'admin');
  };

  const adminPanelUrl = `${getBaseAdminPanelUrl()}/surveys/survey-responses`;
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
