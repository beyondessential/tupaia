import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Dialog, Typography } from '@material-ui/core';
import {
  ModalContentProvider,
  ModalFooter,
  ModalHeader,
  SpinningLoader,
} from '@tupaia/ui-components';
import { DatatrakWebSingleSurveyResponseRequest } from '@tupaia/types';
import { useSurveyResponse } from '../api/queries';
import { Button, SurveyTickIcon } from '../components';
import { displayDate } from '../utils';
import { SurveyReviewSection, useSurveyResponseWithForm } from './Survey';
import { SurveyContext } from '.';

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  width: 100%;

  .MuiSvgIcon-root {
    font-size: 2.5em;
    margin-right: 0.35em;
  }
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
  width: 25rem;
  max-width: 100%;
`;

const Content = styled.div`
  width: 62rem;
  max-width: 100%;
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

  return (
    <>
      <ModalHeader onClose={onClose} title={error ? 'Error loading survey response' : ''}>
        {!showLoading && !error && (
          <Header>
            <SurveyTickIcon />
            <div>
              <Heading>{surveyResponse?.surveyName}</Heading>
              <SubHeading>{subHeading}</SubHeading>
            </div>
          </Header>
        )}
      </ModalHeader>
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
    error,
    isFetching: isFetchingSurveyResponse,
  } = useSurveyResponse(surveyResponseId, { meta: { applyCustomErrorHandling: true } });

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
            isLoading={isFetchingSurveyResponse}
            surveyResponse={surveyResponse}
            error={error as Error}
          />
        </SurveyContext>
      </FormProvider>
    </Dialog>
  );
};
