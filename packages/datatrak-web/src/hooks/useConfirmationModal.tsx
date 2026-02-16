import React, { useCallback, useRef, useState } from 'react';

import { ConfirmationModal, ConfirmationModalProps } from '../components/ConfirmationModal';

interface UseConfirmationModalOptions {
  bypass?: boolean;
}

interface UseConfirmationModalResult {
  /** The input `callback`, guarded. Invokes the callback directly if `bypass` is true. */
  guardedCallback: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  /** The confirmation modal element. Make sure this is rendered. */
  confirmationModal: React.ReactElement<ConfirmationModalProps>;
}

export function useConfirmationModal(
  callback: React.MouseEventHandler<HTMLElement>,
  options?: UseConfirmationModalOptions,
): UseConfirmationModalResult {
  const bypass = options?.bypass ?? false;

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const [isOpen, setIsOpen] = useState(false);

  const guardedCallback = useCallback(
    (mouseEvent: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (bypass) {
        callbackRef.current(mouseEvent);
        return;
      }
      setIsOpen(true);
    },
    [bypass],
  );

  const onConfirm = useCallback((mouseEvent: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setIsOpen(false);
    callbackRef.current(mouseEvent);
  }, []);

  const confirmationModal = (
    <ConfirmationModal isOpen={isOpen} onClose={() => setIsOpen(false)} onConfirm={onConfirm} />
  );

  return { guardedCallback, confirmationModal };
}
