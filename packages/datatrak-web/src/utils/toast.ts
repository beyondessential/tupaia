/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { ReactNode } from 'react';
import { enqueueSnackbar } from 'notistack';

export const successToast = (message: string, icon?: ReactNode) => {
  enqueueSnackbar(message, {
    variant: 'success',
    icon,
  });
};

export const errorToast = (message: string) => {
  enqueueSnackbar(message, {
    variant: 'error',
    autoHideDuration: null, // don't auto hide errors
    hideIconVariant: true,
  });
};
