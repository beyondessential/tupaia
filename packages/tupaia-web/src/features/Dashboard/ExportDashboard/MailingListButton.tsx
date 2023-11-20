/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import BaseErrorIcon from '@material-ui/icons/ErrorOutline';
import BaseSuccessIcon from '@material-ui/icons/CheckCircle';
import { Button, SpinningLoader as BaseSpinningLoader } from '@tupaia/ui-components';
import { useDashboards } from '../../../api/queries';
import { useEmailDashboard } from '../../../api/mutations';
import { ExportSettingLabel } from './ExportSettingLabel';
import { ExportSettingsInstructions } from './ExportSettingsInstructions';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: space-between;
`;

const ButtonContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const SuccessMessage = styled(ExportSettingsInstructions)`
  display: flex;
  align-items: center;
`;

const ErrorMessage = styled(ExportSettingsInstructions)`
  margin-left: 0.9rem;
  display: flex;
  align-items: center;
`;

const SuccessIcon = styled(BaseSuccessIcon)`
  color: ${({ theme }) => theme.palette.success.main};
  width: 1.3rem;
  height: 1.3rem;
  margin-right: 0.3rem;
`;

const ErrorIcon = styled(BaseErrorIcon)`
  color: ${({ theme }) => theme.palette.error.main};
  margin-right: 0.3rem;
  width: 1.3rem;
  height: 1.3rem;
`;

const SendExportButton = styled(Button)`
  padding: 0.25rem 0rem;
  width: 6rem;

  .MuiButton-label {
    font-size: 0.825rem;
  }
`;

const MailingListLabel = styled(ExportSettingLabel)`
  margin-bottom: 0.2rem;
`;

const SpinningLoader = styled(BaseSpinningLoader)`
  .MuiCircularProgress-root {
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;

interface ExportDashboardProps {
  selectedDashboardItems: string[];
}

export const MailingListButton = ({ selectedDashboardItems = [] }: ExportDashboardProps) => {
  const { projectCode, entityCode, dashboardName } = useParams();
  const { activeDashboard } = useDashboards(projectCode, entityCode, dashboardName);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleEmailSuccess = (result: { message: string }) => {
    setSuccessMessage(result.message);
  };

  const { mutate: requestEmailDashboard, isLoading, error } = useEmailDashboard({
    onSuccess: handleEmailSuccess,
  });

  const handleEmail = () =>
    requestEmailDashboard({
      projectCode,
      entityCode,
      dashboardCode: activeDashboard.code,
      selectedDashboardItems,
    });

  return (
    <fieldset>
      <Container>
        <MailingListLabel>Mailing List</MailingListLabel>
        <ExportSettingsInstructions>
          Send export to users who are subscribed to this dashboard.
        </ExportSettingsInstructions>
        <ButtonContainer>
          {successMessage ? (
            <SuccessMessage>
              <SuccessIcon />
              {successMessage}
            </SuccessMessage>
          ) : (
            <>
              <SendExportButton
                variant="outlined"
                color="default"
                onClick={handleEmail}
                disabled={isLoading}
              >
                {isLoading ? <SpinningLoader spinnerSize="1.45rem" /> : 'Send export'}
              </SendExportButton>
              {error ? (
                <ErrorMessage>
                  <ErrorIcon />
                  {`Export failed: ${error.message}`}
                </ErrorMessage>
              ) : null}
            </>
          )}
        </ButtonContainer>
      </Container>
    </fieldset>
  );
};
