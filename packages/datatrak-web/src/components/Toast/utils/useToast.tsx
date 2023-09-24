/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { enqueueSnackbar } from 'notistack';
import { Coconut, Pig } from '../../Icons';
import { errorToast } from '.';

/**
 * Utility hook for displaying toast messages.
 */
export const useToast = () => {
  const success = (message: string) => {
    enqueueSnackbar(message, {
      variant: 'success',
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
    error: errorToast,
    coconut,
    pig,
  };
};
