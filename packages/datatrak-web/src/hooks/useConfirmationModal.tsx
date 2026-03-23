import React, { useCallback, useRef, useState } from 'react';

import { ConfirmationModal, ConfirmationModalProps } from '../components/ConfirmationModal';

interface UseConfirmationModalOptions {
  bypass?: boolean;
  confirmationModalProps?: Pick<
    ConfirmationModalProps,
    'heading' | 'description' | 'confirmLabel' | 'cancelLabel'
  >;
  /** Called when the modal is dismissed without confirming (close or cancel). */
  onClose?: () => void;
}

interface UseConfirmationModalResult {
  /** The input `callback`, guarded. Invokes the callback directly if `bypass` is true. */
  guardedCallback: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  /** The confirmation modal element. Make sure this is rendered. */
  confirmationModal: React.ReactElement<ConfirmationModalProps>;
}

export function useConfirmationModal(
  callback: React.MouseEventHandler<HTMLElement>,
  options: UseConfirmationModalOptions = {},
): UseConfirmationModalResult {
  const { bypass = false, confirmationModalProps, onClose: onCloseOption } = options;

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const [isOpen, setIsOpen] = useState(false);

  const guardedCallback = useCallback(
    async (mouseEvent: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (bypass) {
        await callbackRef.current(mouseEvent);
        return;
      }
      mouseEvent.preventDefault();
      setIsOpen(true);
    },
    [bypass],
  );

  const onConfirm = useCallback((mouseEvent: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setIsOpen(false);
    callbackRef.current(mouseEvent);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onCloseOption?.();
  }, [onCloseOption]);

  const confirmationModal = (
    <ConfirmationModal
      {...confirmationModalProps}
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={onConfirm}
    />
  );

  return { guardedCallback, confirmationModal };
}
