import React, { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ConfirmationModal } from '../../../components';
import { useBeforeUnload } from '../../../utils';
import { useSurveyForm } from '../SurveyContext';

export const CancelSurveyConfirmationToken = () => {
  const { cancelModalOnConfirm, cancelModalOpen, closeCancelConfirmation, isSuccessScreen } =
    useSurveyForm();

  const navigate = useNavigate();
  const { formState } = useFormContext();

  useBeforeUnload(formState.isDirty && !isSuccessScreen);

  const handleConfirm = useCallback(() => {
    closeCancelConfirmation();
    if (cancelModalOnConfirm) {
      cancelModalOnConfirm();
    } else {
      navigate('/');
    }
  }, [closeCancelConfirmation, navigate, cancelModalOnConfirm]);

  return (
    <ConfirmationModal
      isOpen={cancelModalOpen}
      onClose={closeCancelConfirmation}
      onConfirm={handleConfirm}
    />
  );
};
