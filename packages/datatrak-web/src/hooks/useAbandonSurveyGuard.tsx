import { useCallback } from 'react';
import { useMatch } from 'react-router';

import { ROUTES } from '../constants';
import { useSaveAsDraft } from '../features/Survey/hooks/useSaveAsDraft';
import { useConfirmationModal } from './useConfirmationModal';

export function useAbandonSurveyGuard<T extends React.MouseEventHandler<HTMLElement>>(
  callback: T,
): ReturnType<typeof useConfirmationModal> {
  const isSurveyScreen = !!useMatch(ROUTES.SURVEY_SCREEN);
  const isSuccessScreen = !!useMatch(ROUTES.SURVEY_SUCCESS);
  const isSurveyActive = isSurveyScreen && !isSuccessScreen;

  const { saveAsDraft, isLoading } = useSaveAsDraft();

  const handleSaveDraft = useCallback(async () => {
    await saveAsDraft();
  }, [saveAsDraft]);

  return useConfirmationModal(callback, {
    bypass: !isSurveyActive,
    confirmationModalProps: {
      heading: 'Survey in progress',
      description:
        "If you exit, you will lose the progress you've made on the current survey. Would you like to save as a draft or exit without saving?",
      confirmLabel: 'Exit without saving',
      cancelLabel: 'Save draft',
      onCancel: handleSaveDraft,
      cancelDisabled: isLoading,
    },
  });
}
