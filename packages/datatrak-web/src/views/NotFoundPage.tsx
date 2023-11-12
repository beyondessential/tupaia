/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { DialogActions } from '@material-ui/core';
import { Button, ErrorDisplay } from '../components';

export const NotFoundPage = ({ error }: { error?: Error }) => {
  return (
    <ErrorDisplay title="404: Page not found" error={error}>
      <DialogActions>
        <Button to="/" color="primary">
          Return to home
        </Button>
      </DialogActions>
    </ErrorDisplay>
  );
};
