/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { ErrorPage } from './ErrorPage';

/**
 * Wrapper Page for displaying an error message from location state
 */
export const NotAuthorisedPage = () => {
  const location = useLocation();
  // Casting here because location.state can be anything
  const { state } = location as {
    state: {
      errorMessage: string;
    };
  };
  // If the user has been mistakenly redirected to this page, redirect them to the home page
  if (!state?.errorMessage) return <Navigate to="/" />;
  return <ErrorPage title="Not authorised" errorMessage={state?.errorMessage} />;
};
