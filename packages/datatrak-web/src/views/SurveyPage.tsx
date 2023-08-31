/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { FullPageLoader, Alert } from '@tupaia/ui-components';
import styled from 'styled-components';
import { useSurveyScreenComponents } from '../api/queries';
import { SurveyContext } from '../features';
import { SurveyParams } from '../types';
import { HEADER_HEIGHT } from '../constants';
import { TopProgressBar } from '../components';

const Container = styled.div`
  height: calc(100vh - ${HEADER_HEIGHT});
  display: flex;
  flex-direction: column;
`;

const Toolbar = styled.div`
  height: 4.7rem;
  background: rgba(0, 65, 103, 0.3);
  margin-left: -0.9375rem;
  margin-right: -0.9375rem;
`;

export const SurveyPage = () => {
  const { surveyCode, screenNumber } = useParams<SurveyParams>();
  const {
    isSuccess,
    isLoading,
    isError,
    error,
    data: surveyScreenComponents,
  } = useSurveyScreenComponents(surveyCode);
  const numberOfScreens = Object.keys(surveyScreenComponents).length;

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!isSuccess || (isError && error)) {
    return <Alert severity="error">`There was an error ${error}`</Alert>;
  }

  return (
    <SurveyContext>
      <Container>
        <Toolbar />
        <TopProgressBar
          currentSurveyQuestion={screenNumber}
          totalNumberOfSurveyQuestions={numberOfScreens}
        />
        {/* Use a key to render a different survey screen component for every screen number. This is so
      that the screen can be easily initialised with the form data. See https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes */}
        <Outlet key={screenNumber} />
      </Container>
    </SurveyContext>
  );
};
