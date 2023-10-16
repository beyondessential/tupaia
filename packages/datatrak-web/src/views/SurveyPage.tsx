/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { FullPageLoader } from '@tupaia/ui-components';
import { useSurvey } from '../api/queries';
import { CancelSurveyModal, SurveyToolbar } from '../features';
import { SurveyParams } from '../types';

// wrap the entire page so that other content can be centered etc
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const SurveyPage = () => {
  const { surveyCode, screenNumber } = useParams<SurveyParams>();
  const { isLoading } = useSurvey(surveyCode);

  if (isLoading) {
    return <FullPageLoader />;
  }
  return (
    <PageWrapper>
      <SurveyToolbar />
      {/* Use a key to render a different survey screen component for every screen number. This is so
      that the screen can be easily initialised with the form data. See https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes */}
      <Outlet key={screenNumber} />
      <CancelSurveyModal />
    </PageWrapper>
  );
};
