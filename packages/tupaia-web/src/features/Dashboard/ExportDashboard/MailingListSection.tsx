import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import BaseErrorIcon from '@material-ui/icons/ErrorOutline';
import BaseSuccessIcon from '@material-ui/icons/CheckCircle';
import { TupaiaWebEmailDashboardRequest } from '@tupaia/types';
import { Button, SpinningLoader as BaseSpinningLoader } from '@tupaia/ui-components';
import { useEmailDashboard } from '../../../api/mutations';
import { ExportSettingLabel } from '../../ExportSettings';
import { useDashboard, useDashboardMailingList } from '../utils';
import { ExportSubtitle } from './ExportSubtitle';

const Wrapper = styled.section`
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

const ResponseMessage = styled(ExportSubtitle)`
  display: flex;
  align-items: center;
  line-height: normal;
`;

const ErrorMessage = styled(ExportSubtitle)`
  margin-left: 0.9rem;
  display: flex;
  align-items: center;
  line-height: normal;
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

export const MailingListSection = ({
  selectedDashboardItems,
  settings,
}: Pick<TupaiaWebEmailDashboardRequest.ReqBody, 'selectedDashboardItems' | 'settings'>) => {
  const { projectCode, entityCode } = useParams();
  const { activeDashboard } = useDashboard();
  const mailingList = useDashboardMailingList();
  const showMailingList = mailingList && mailingList.isAdmin;
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  // lazy assumption that the success message contains the word 'success', probably will be fine
  const isSuccessfulExport = responseMessage !== null && responseMessage.includes('success');

  const handleEmailComplete = (result: { message: string }) => {
    setResponseMessage(result.message);
  };

  const {
    mutate: requestEmailDashboard,
    isLoading,
    error,
  } = useEmailDashboard({
    onSuccess: handleEmailComplete,
  });

  if (!showMailingList) return null;

  const handleEmail = () =>
    requestEmailDashboard({
      projectCode,
      entityCode,
      dashboardCode: activeDashboard?.code,
      selectedDashboardItems,
      settings,
    });

  return (
    <Wrapper>
      <MailingListLabel>Mailing list</MailingListLabel>
      <ExportSubtitle>Send export to users who are subscribed to this dashboard.</ExportSubtitle>
      <ButtonContainer>
        {responseMessage ? (
          <ResponseMessage>
            {isSuccessfulExport ? <SuccessIcon /> : null}
            {responseMessage}
          </ResponseMessage>
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
    </Wrapper>
  );
};
