/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SnackbarProvider } from 'notistack';
import { Toast } from './Toast';

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SnackbarProvider
      Components={{
        success: Toast,
        error: Toast,
        warning: Toast,
        info: Toast,
      }}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      domRoot={document.getElementById('page')!} // this is so we can style the snackbar container to set under the header
    >
      {children}
    </SnackbarProvider>
  );
};
