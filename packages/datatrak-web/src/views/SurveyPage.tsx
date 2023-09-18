/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { FullPageLoader, Alert } from '@tupaia/ui-components';
import { useSurveyScreenComponents } from '../api/queries';
import { SurveyContext } from '../features';
import { SurveyParams } from '../types';
import { SurveyToolbar } from '../features/Survey/SurveyToolbar';

// wrap the entire page so that other content can be centered etc
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const SurveyPage = () => {
  const { surveyCode, screenNumber } = useParams<SurveyParams>();
  const { isSuccess, isLoading, isError, error } = useSurveyScreenComponents(surveyCode);

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!isSuccess || (isError && error)) {
    return <Alert severity="error">`There was an error ${error}`</Alert>;
  }

  return (
    <SurveyContext>
      <PageWrapper>
        <SurveyToolbar />
        {/* Use a key to render a different survey screen component for every screen number. This is so
      that the screen can be easily initialised with the form data. See https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes */}
        <Outlet key={screenNumber} />
      </PageWrapper>
    </SurveyContext>
  );
};
