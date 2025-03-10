import { Dialog, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { DatatrakWebSingleSurveyResponseRequest } from '@tupaia/types';
import { ModalContentProvider, ModalFooter, SpinningLoader } from '@tupaia/ui-components';

import { SurveyContext } from '.';
import { useExportSurveyResponse } from '../api';
import { useSurveyResponse } from '../api/queries';
import { Button, DownloadIcon, SurveyTickIcon } from '../components';
import { displayDate } from '../utils';
import { SurveyReviewSection, useSurveyResponseWithForm } from './Survey';

const Header = styled.header`
  align-items: center;
  display: flex;
  inline-size: 100%;
  padding-block: 1.5rem 1.2rem;
  padding-inline: 1.8rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Heading = styled(Typography).attrs({
  variant: 'h2',
})`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 1.5rem;
  font-weight: 600;
  margin-block-end: 0.2rem;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    font-size: 1rem;
  }
`;

const SubHeading = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 1rem;
  font-weight: 400;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    font-size: 0.875rem;
  }
`;

const StyledModalContentProvider = styled(ModalContentProvider)`
  inline-size: 60rem;
  max-inline-size: 100%;
  min-block-size: 12rem;
`;

const Icon = styled(SurveyTickIcon).attrs({
  'aria-hidden': true,
})`
  font-size: 2.5rem;
  margin-right: 0.35rem;
`;

const DownloadButton = styled(Button).attrs({
  variant: 'outlined',
})`
  margin-left: auto;
  min-inline-size: fit-content;
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
    useExportSurveyResponse(surveyResponseId!, surveyResponse?.timezone);

  const isNotClaustrophobic = useMediaQuery(useTheme().breakpoints.up('sm'));

  return (
    <>
      <Header>
        {!showLoading && !error && (
          <>
            {isNotClaustrophobic && <Icon />}
            <div>
              <Heading>{surveyResponse?.surveyName}</Heading>
              <SubHeading>{subHeading}</SubHeading>
            </div>
            <DownloadButton
              onClick={downloadSurveyResponse}
              isLoading={isDownloadingSurveyResponse}
              loadingText="Downloading"
              startIcon={isNotClaustrophobic && <DownloadIcon />}
            >
              Download
            </DownloadButton>
          </>
        )}
      </Header>
      <StyledModalContentProvider error={error as Error}>
        {showLoading ? (
          <SpinningLoader style={{ margin: 'auto' }} />
        ) : (
          !error && <SurveyReviewSection />
        )}
      </StyledModalContentProvider>
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
