/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

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
import { useSurveyResponseWithForm } from '../api/queries';
import { SurveyReviewSection } from './Survey/Components';
import { Button, SurveyTickIcon } from '../components';
import { displayDate } from '../utils';
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

const getSubHeadingText = surveyResponse => {
  if (!surveyResponse) {
    return null;
  }
  const date = displayDate(surveyResponse.dataTime);
  const country = surveyResponse?.countryName;
  const entity = surveyResponse?.entityName;
  const location = country === entity ? country : `${entity} | ${country}`;
  return `${location} ${date}`;
};

// Needs to be wrapped in a context provider to provide the form data to the form
const SurveyResponseModalContent = ({ onClose }: { onClose: () => void }) => {
  const [urlSearchParams] = useSearchParams();

  const surveyResponseId = urlSearchParams.get('responseId');

  const {
    data: surveyResponse,
    isLoading,
    isFetched,
  } = useSurveyResponseWithForm(surveyResponseId);

  const subHeading = getSubHeadingText(surveyResponse);

  const showLoading = isLoading || !isFetched;

  return (
    <>
      <ModalHeader onClose={onClose}>
        {!showLoading && (
          <Header>
            <SurveyTickIcon />
            <div>
              <Heading>{surveyResponse?.surveyName}</Heading>
              <SubHeading>{subHeading}</SubHeading>
            </div>
          </Header>
        )}
      </ModalHeader>
      <ModalContentProvider>
        {showLoading ? <Loader /> : <SurveyReviewSection />}
      </ModalContentProvider>
      <ModalFooter>
        <Button to="/">Close</Button>
      </ModalFooter>
    </>
  );
};

export const SurveyResponseModal = () => {
  const formContext = useForm();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  const surveyResponseId = urlSearchParams.get('responseId');
  const surveyCode = urlSearchParams.get('surveyCode');
  const countryCode = urlSearchParams.get('countryCode');

  const onClose = () => {
    // Redirect to the previous page by removing all the query params
    urlSearchParams.delete('responseId');
    urlSearchParams.delete('surveyCode');
    urlSearchParams.delete('countryCode');
    setUrlSearchParams(urlSearchParams);
  };

  if (!surveyResponseId) return null;

  return (
    <Dialog open onClose={onClose} maxWidth="md">
      <FormProvider {...formContext}>
        <SurveyContext surveyCode={surveyCode} countryCode={countryCode}>
          <SurveyResponseModalContent onClose={onClose} />
        </SurveyContext>
      </FormProvider>
    </Dialog>
  );
};
