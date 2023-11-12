/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { DialogActions } from '@material-ui/core';
import { Button, ErrorDisplay } from '../components';

interface NotFoundPageProps {
  error?: Error;
  title?: string;
}

export const NotFoundPage = ({ error, title = "404: Page not found" }:NotFoundPageProps) => {
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
