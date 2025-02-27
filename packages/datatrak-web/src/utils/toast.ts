import { enqueueSnackbar, OptionsObject } from 'notistack';

export const successToast = (message: string, Icon?: OptionsObject['Icon']) => {
  enqueueSnackbar(message, {
    variant: 'success',
    Icon,
  });
};

export const errorToast = (message: string) => {
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
