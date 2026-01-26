import { enqueueSnackbar, OptionsObject } from 'notistack';

export const successToast = (message: string, Icon?: OptionsObject['Icon']) => {
  enqueueSnackbar(message, {
    variant: 'success',
    Icon,
  });
};

export const errorToast = (message: string) => {
  const stack = new Error().stack;
  
  // Parse stack to get the caller
  const stackLines = stack?.split('\n') || [];
  const caller = stackLines[2]; // Line 0 is "Error", line 1 is errorToast, line 2 is the caller
  
  console.group(`🔴 Error Toast: ${message}`);
  console.error('Called from:', caller?.trim());
  console.error('Full stack:', stack);
  console.groupEnd();

  enqueueSnackbar(message, {
    variant: 'error',
    autoHideDuration: null, // don't auto hide errors
    hideIconVariant: true,
  });
};

interface ToastOptions extends OptionsObject {
  Icon?: OptionsObject['Icon'];
  hideCloseButton?: boolean;
}

export const infoToast = (message: string, options?: ToastOptions) => {
  enqueueSnackbar(message, {
    variant: 'info',
    autoHideDuration: 2000,
    hideIconVariant: true,
    ...options,
  });
};
