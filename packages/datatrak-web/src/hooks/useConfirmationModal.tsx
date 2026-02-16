import React, { useCallback, useRef, useState } from 'react';

import { ConfirmationModal } from '../components/ConfirmationModal';

interface UseConfirmationModalOptions {
  bypass?: boolean;
}

/**
 * Guards a callback behind a confirmation modal.
 *
 * @param callback The callback to guard.
 * @param options.bypass If true, the modal is skipped and the callback is invoked directly.
 *   Defaults to false.
 */
export function useConfirmationModal<T extends (...args: any[]) => any>(
  callback: T,
  options?: UseConfirmationModalOptions,
): {
  /** The input `callback`, guarded. Invokes the callback directly if `bypass` is true. */
  guardedCallback: (...args: Parameters<T>) => ReturnType<T> | void;
  /** The confirmation modal element. Render this in your component tree. */
  confirmationModal: JSX.Element;
} {
  const bypass = options?.bypass ?? false;

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const [isOpen, setIsOpen] = useState(false);

  const guardedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (!bypass) {
        setIsOpen(true);
        return;
      }
      return callbackRef.current(...args);
    },
    [bypass],
  );

  // Tech debt: ConfirmationModal's onConfirm prop is typed () => {}
  const onConfirm = useCallback(() => {
    setIsOpen(false);
    callbackRef.current();
  }, []);

  const confirmationModal = (
    <ConfirmationModal isOpen={isOpen} onClose={() => setIsOpen(false)} onConfirm={onConfirm} />
  );

  return { guardedCallback, confirmationModal };
}
