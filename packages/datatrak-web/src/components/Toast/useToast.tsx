/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { enqueueSnackbar } from 'notistack';
import { Coconut, Pig } from '../Icons';

/**
 * Utility hook for displaying toast messages.
 */
export const useToast = () => {
  const success = (message: string) => {
    enqueueSnackbar(message, {
      variant: 'success',
    });
  };

  const error = (message: string) => {
    enqueueSnackbar(message, {
      variant: 'error',
      autoHideDuration: null, // don't auto hide errors
      hideIconVariant: true,
    });
  };

  const coconut = () => {
    enqueueSnackbar("Congratulations! You've earned a coconut.", {
      variant: 'success',
      icon: <Coconut />,
    });
  };

  const pig = () => {
    enqueueSnackbar("Congratulations! You've earned a pig.", {
      variant: 'success',
      icon: <Pig />,
    });
  };

  return {
    success,
    error,
    coconut,
    pig,
  };
};
