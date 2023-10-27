/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { useForm, FormProvider } from 'react-hook-form';
import { FullPageLoader } from '@tupaia/ui-components';
import { useSurvey } from '../api/queries';
import {
  CancelSurveyModal,
  SurveyToolbar,
  useSurveyForm,
  useValidationResolver,
  SurveySideMenu,
} from '../features';
import { SurveyParams } from '../types';
import { HEADER_HEIGHT, SURVEY_TOOLBAR_HEIGHT } from '../constants';

// wrap the entire page so that other content can be centered etc
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SurveyScreenContainer = styled.div`
  display: flex;
  overflow: hidden;
  align-items: flex-start;
  height: calc(100vh - ${HEADER_HEIGHT} - ${SURVEY_TOOLBAR_HEIGHT});

  ${({ theme }) => theme.breakpoints.up('md')} {
    margin-left: -1.25rem;
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
`;

export const SurveyPage = () => {
  const { surveyCode, screenNumber } = useParams<SurveyParams>();
  const { isLoading } = useSurvey(surveyCode);
  const { formData } = useSurveyForm();
  const resolver = useValidationResolver();
  const formContext = useForm({ defaultValues: formData, reValidateMode: 'onSubmit', resolver });

  if (isLoading) {
    return <FullPageLoader />;
  }
  return (
    // The form provider has to be outside the outlet so that the form context is available to all. This is also so that the side menu can be outside of the 'SurveyLayout' page, because otherwise it rerenders on survey screen change, which makes it close and open again every time you change screen via the jump-to menu. The survey side menu needs to be inside the form provider so that it can access the form context to save form data
    <PageWrapper>
      <FormProvider {...formContext}>
        <SurveyToolbar />
        <SurveyScreenContainer>
          <SurveySideMenu />
          {/* Use a key to render a different survey screen component for every screen number. This is so
      that the screen can be easily initialised with the form data. See https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes */}
          <Outlet key={screenNumber} />
        </SurveyScreenContainer>
      </FormProvider>
      <CancelSurveyModal />
    </PageWrapper>
  );
};
