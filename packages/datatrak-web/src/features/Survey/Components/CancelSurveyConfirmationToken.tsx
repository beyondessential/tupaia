import React, { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ConfirmationModal } from '../../../components';
import { useBeforeUnload } from '../../../utils';
import { useSurveyForm } from '../SurveyContext';
import { useSaveAsDraft } from '../hooks/useSaveAsDraft';

export const CancelSurveyConfirmationToken = () => {
  const { cancelModalConfirmLink, cancelModalOpen, closeCancelConfirmation, isSuccessScreen } =
    useSurveyForm();

  const navigate = useNavigate();
  const { formState } = useFormContext();
  const { saveAsDraft, isLoading } = useSaveAsDraft();

  useBeforeUnload(formState.isDirty && !isSuccessScreen);

  const handleExitWithoutSaving = useCallback(() => {
    closeCancelConfirmation();
    navigate(cancelModalConfirmLink);
  }, [closeCancelConfirmation, navigate, cancelModalConfirmLink]);

  const handleSaveDraft = useCallback(async () => {
    closeCancelConfirmation();
    await saveAsDraft();
  }, [closeCancelConfirmation, saveAsDraft]);

  return (
    <ConfirmationModal
      isOpen={cancelModalOpen}
      onClose={closeCancelConfirmation}
      onConfirm={handleExitWithoutSaving}
      onCancel={handleSaveDraft}
      heading="Survey in progress"
      description="If you exit, you will lose the progress you've made on the current survey. Would you like to save as a draft or exit without saving?"
      confirmLabel="Exit without saving"
      cancelLabel="Save draft"
      cancelDisabled={isLoading}
    />
  );
};
