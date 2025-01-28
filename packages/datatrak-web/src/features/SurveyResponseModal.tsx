import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Dialog, Typography } from '@material-ui/core';
import { ModalContentProvider, ModalFooter, SpinningLoader } from '@tupaia/ui-components';
import { DatatrakWebSingleSurveyResponseRequest } from '@tupaia/types';
import { useSurveyResponse } from '../api/queries';
import { Button, DownloadIcon, SurveyTickIcon } from '../components';
import { displayDate } from '../utils';
import { SurveyReviewSection, useSurveyResponseWithForm } from './Survey';
import { SurveyContext } from '.';
import { useExportSurveyResponse } from '../api';

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.8rem 1.2rem;
  width: 100%;
`;

const Heading = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.palette.text.primary};
  font-weight: 600;
  margin-bottom: 0.2rem;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    font-size: 1rem;
  }
`;

const SubHeading = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-weight: 400;
  font-size: 1rem;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    font-size: 0.875rem;
  }
`;

const Loader = styled(SpinningLoader)`
  padding-block: 3rem;
  max-width: 100%;
`;

const Content = styled.div`
  min-height: 10rem;
  width: 62rem;
  max-width: 100%;
`;

const Icon = styled(SurveyTickIcon)`
  font-size: 2.5rem;
  margin-right: 0.35rem;
`;

const DownloadButton = styled(Button).attrs({
  variant: 'outlined',
})`
  margin-left: auto;
  &.Mui-disabled.MuiButtonBase-root {
    opacity: 0.5;
    color: ${({ theme }) => theme.palette.primary.main};
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const getSubHeadingText = surveyResponse => {
  if (!surveyResponse) {
    return null;
  }
  const date = displayDate(surveyResponse.dataTime);
  const { entityName, entityParentName } = surveyResponse;
  const location = [entityName, entityParentName].filter(Boolean).join(' | ');
  return `${location} ${date}`;
};
interface SurveyResponseModalContentProps {
  onClose: () => void;
  surveyResponse?: DatatrakWebSingleSurveyResponseRequest.ResBody;
  error?: Error;
  isLoading?: boolean;
}

// Needs to be wrapped in a context provider to provide the form data to the form
const SurveyResponseModalContent = ({
  onClose,
  isLoading,
  surveyResponse,
  error,
}: SurveyResponseModalContentProps) => {
  const { surveyLoading } = useSurveyResponseWithForm(surveyResponse);
  const subHeading = getSubHeadingText(surveyResponse);
  const showLoading = isLoading || surveyLoading;
  const [urlSearchParams] = useSearchParams();
  const surveyResponseId = urlSearchParams.get('responseId');
  const { mutate: downloadSurveyResponse, isLoading: isDownloadingSurveyResponse } =
    useExportSurveyResponse(surveyResponseId!);

  return (
    <>
      <Header>
        {!showLoading && !error && (
          <>
            <Icon />
            <div>
              <Heading>{surveyResponse?.surveyName}</Heading>
              <SubHeading>{subHeading}</SubHeading>
            </div>
            <DownloadButton
              onClick={downloadSurveyResponse}
              isLoading={isDownloadingSurveyResponse}
              loadingText="Downloading"
              startIcon={<DownloadIcon />}
            >
              Download
            </DownloadButton>
          </>
        )}
      </Header>
      <ModalContentProvider error={error as Error}>
        <Content>
          {showLoading && <Loader />}
          {!showLoading && !error && <SurveyReviewSection />}
        </Content>
      </ModalContentProvider>
      <ModalFooter>
        <Button onClick={onClose}>Close</Button>
      </ModalFooter>
    </>
  );
};

export const SurveyResponseModal = () => {
  const formContext = useForm();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  const surveyResponseId = urlSearchParams.get('responseId');

  const {
    data: surveyResponse,
    isLoading,
    error,
    isFetched,
  } = useSurveyResponse(surveyResponseId, { meta: { applyCustomErrorHandling: true } });

  const isLoadingSurveyResponse = isLoading || !isFetched;

  const onClose = () => {
    // Redirect to the previous page by removing all the query params
    urlSearchParams.delete('responseId');
    setUrlSearchParams(urlSearchParams);
  };

  if (!surveyResponseId) return null;

  return (
    <Dialog open onClose={onClose} maxWidth="md">
      <FormProvider {...formContext}>
        <SurveyContext
          surveyCode={surveyResponse?.surveyCode}
          countryCode={surveyResponse?.countryCode}
        >
          <SurveyResponseModalContent
            onClose={onClose}
            isLoading={isLoadingSurveyResponse}
            surveyResponse={surveyResponse}
            error={error as Error}
          />
        </SurveyContext>
      </FormProvider>
    </Dialog>
  );
};
