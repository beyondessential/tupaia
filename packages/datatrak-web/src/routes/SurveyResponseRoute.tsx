/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Outlet, useOutletContext, useParams } from 'react-router-dom';
import { useSurveyResponse } from '../api';

export const SurveyResponseRoute = () => {
  const { surveyResponseId } = useParams();

  const outletContext = useOutletContext();

  const { isLoading } = useSurveyResponse(surveyResponseId);

  // When the survey response is loading, don't render the children, in case there is a permissions error or the response is not found
  if (isLoading) return null;
  // Need to pass down the context to the other survey pages; necessary for layout and navigation
  return <Outlet context={outletContext} />;
};
