import React from 'react';
import { DialogActions } from '@material-ui/core';
import { Button, ErrorDisplay } from '../components';

interface ErrorPageProps {
  errorMessage?: string;
  title?: string;
}

export const ErrorPage = ({ errorMessage, title = '404: Page not found' }: ErrorPageProps) => {
  return (
    <ErrorDisplay title={title} errorMessage={errorMessage}>
      <DialogActions>
        <Button to="/" color="primary">
          Return to home
        </Button>
      </DialogActions>
    </ErrorDisplay>
  );
};
