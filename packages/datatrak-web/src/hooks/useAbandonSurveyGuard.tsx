import React, { useCallback, useRef, useState } from 'react';
import { useMatch } from 'react-router';

import { ConfirmationModal } from '../components/ConfirmationModal';
import { ROUTES } from '../constants';

/**
 * @param destructiveCallback The callback to be guarded
 */
export function useAbandonSurveyGuard<T extends (...args: any[]) => any>(
  destructiveCallback: T,
): {
  /**
   * The input `destructiveCallback`, guarded. If an survey is in-progress, the `confirmationModal`
   * will be shown to prompt the user for confirmation before proceeding.
   */
  guardedCallback: (...args: Parameters<T>) => ReturnType<T> | void; // Returns void if intercepted
  /** The confirmation modal that shows when the callback is intercepted. */
  confirmationModal: JSX.Element;
} {
  const callbackRef = useRef(destructiveCallback);
  callbackRef.current = destructiveCallback;

  const [isOpen, setIsOpen] = useState(false);
  const isSurveyScreen = !!useMatch(ROUTES.SURVEY_SCREEN);
  const isSuccessScreen = !!useMatch(ROUTES.SURVEY_SUCCESS);
  const isSurveyActive = isSurveyScreen && !isSuccessScreen;

  const guardedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (isSurveyActive) {
        // Intercept and prompt user for confirmation
        setIsOpen(true);
        // Delegate invoking callback to the confirmation modal’s onConfirm
        return;
      }
      // Proceed safely with callback
      return callbackRef.current(...args);
    },
    [isSurveyActive],
  );

  // Tech debt: ConfirmationModal’s onConfirm prop is typed () => {}
  const onConfirm = useCallback(() => {
    setIsOpen(false);
    callbackRef.current();
  }, []);

  const confirmationModal = (
    <ConfirmationModal isOpen={isOpen} onClose={() => setIsOpen(false)} onConfirm={onConfirm} />
  );

  return { guardedCallback, confirmationModal };
}
