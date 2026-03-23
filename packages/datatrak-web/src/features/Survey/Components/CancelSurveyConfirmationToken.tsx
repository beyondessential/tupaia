import React, { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { ConfirmationModal } from '../../../components';
import { useBeforeUnload } from '../../../utils';
import { useSurveyForm } from '../SurveyContext';
import { useSaveAsDraft } from '../hooks/useSaveAsDraft';
import { useNavigationBlocker } from '../hooks/useNavigationBlocker';

export const CancelSurveyConfirmationToken = () => {
  const { isSuccessScreen } = useSurveyForm();

  const { formState } = useFormContext();
  const { saveAsDraft } = useSaveAsDraft();

  const shouldBlock = formState.isDirty && !isSuccessScreen;

  useBeforeUnload(shouldBlock);

  const [isOpen, setIsOpen] = useState(false);

  const handleBlock = () => {
    console.log('handle block');
    setIsOpen(true);
  };

  const { proceed, reset, disable } = useNavigationBlocker(shouldBlock, handleBlock);

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  const handleCancel = () => {
    setIsOpen(false);
    proceed();
  };

  const handleSaveDraft = useCallback(async () => {
    setIsOpen(false);
    // Disable the blocker so saveAsDraft's internal navigate('/') passes through
    disable();
    await saveAsDraft();
  }, [disable, saveAsDraft]);

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={handleClose}
      onCancel={handleCancel}
      onConfirm={handleSaveDraft}
      heading="Survey in progress"
      confirmLabel="Save draft"
      cancelLabel="Exit without saving"
    />
  );
};
