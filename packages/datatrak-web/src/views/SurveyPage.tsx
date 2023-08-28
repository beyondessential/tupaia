/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import { FullPageLoader, Alert } from '@tupaia/ui-components';
import styled from 'styled-components';
import { useSurveyScreenComponents } from '../api/queries';
import { SurveyScreen, SurveyContext } from '../features';
import { SurveyParams } from '../types';
import { HEADER_HEIGHT } from '../constants';

const Container = styled.div`
  height: calc(100vh - ${HEADER_HEIGHT});
  display: flex;
  flex-direction: column;
`;

const Toolbar = styled.div`
  min-height: 75px;
  width: 100%;
  background: rgba(0, 65, 103, 0.3);
  margin-left: -15px;
  margin-right: -15px;
`;

export const SurveyPage = () => {
  const { surveyCode, screenNumber } = useParams<SurveyParams>();
  const {
    data: surveyScreenComponents,
    isSuccess,
    isLoading,
    isError,
    error,
  } = useSurveyScreenComponents(surveyCode);
  const activeScreen = surveyScreenComponents[screenNumber!];
  const numberOfScreens = Object.keys(surveyScreenComponents).length;
  const isLast = parseInt(screenNumber!, 10) === numberOfScreens;

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
        {/* Use a key to render a different survey screen component for every screen number. This is so
      that the screen can be easily initialised with the form data. See https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes */}
        <SurveyScreen surveyScreen={activeScreen} isLast={isLast} key={screenNumber} />
      </Container>
    </SurveyContext>
  );
};
