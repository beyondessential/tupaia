/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { DialogActions } from '@material-ui/core';
import { Button, ErrorDisplay } from '../components';

interface ErrorPageProps {
  error?: Error;
  title?: string;
}

export const ErrorPage = ({ error, title = '404: Page not found' }: ErrorPageProps) => {
  return (
    <ErrorDisplay title={title} error={error}>
      <DialogActions>
        <Button to="/" color="primary">
          Return to home
        </Button>
      </DialogActions>
    </ErrorDisplay>
  );
};
