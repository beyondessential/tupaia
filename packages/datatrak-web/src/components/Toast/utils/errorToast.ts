/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { enqueueSnackbar } from 'notistack';

export const errorToast = (message: string) => {
  enqueueSnackbar(message, {
    variant: 'error',
    autoHideDuration: null, // don't auto hide errors
    hideIconVariant: true,
  });
};
