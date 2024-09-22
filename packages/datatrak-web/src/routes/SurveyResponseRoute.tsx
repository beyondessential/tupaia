/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Outlet, useOutletContext, useParams } from 'react-router-dom';
import { useSurveyResponse } from '../api';
import { useSurveyResponseWithForm } from '../features/Survey';

export const SurveyResubmitRoute = () => {
  const { surveyResponseId } = useParams();

  const outletContext = useOutletContext();

  const { isLoading, data: surveyResponse } = useSurveyResponse(surveyResponseId);
  const { surveyLoading } = useSurveyResponseWithForm(surveyResponse);

  // When the survey response is loading, don't render the children, in case there is a permissions error or the response is not found
  if (isLoading || surveyLoading) return null;
  // Need to pass down the context to the other survey pages; necessary for layout and navigation
  return <Outlet context={outletContext} />;
};
