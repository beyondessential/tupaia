/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Outlet, useOutletContext, useParams } from 'react-router-dom';
import { useSurveyForm } from '../features';
import { useSurveyResponse } from '../api';

export const ResubmitResponseRoute = () => {
  const { surveyResponseId } = useParams();
  const { setFormData } = useSurveyForm();
  const formContext = useFormContext();
  const { data: surveyResponse, isLoading } = useSurveyResponse(surveyResponseId);
  const answers = surveyResponse?.answers || {};
  const outletContext = useOutletContext();

  useEffect(() => {
    if (answers && !isLoading) {
      // Format the answers to be compatible with the form, i.e. parse stringified objects
      const formattedAnswers = Object.entries(answers).reduce((acc, [key, value]) => {
        // If the value is a stringified object, parse it
        const isStringifiedObject = typeof value === 'string' && value.startsWith('{');
        return { ...acc, [key]: isStringifiedObject ? JSON.parse(value) : value };
      }, {});
      formContext.reset(formattedAnswers);
      setFormData(formattedAnswers);
    }
  }, [isLoading]);

  // When the survey response is loading, don't render the children, in case there is a permissions error or the response is not found
  if (isLoading) return null;
  // Need to pass down the context to the survey pages
  return <Outlet context={outletContext} />;
};
