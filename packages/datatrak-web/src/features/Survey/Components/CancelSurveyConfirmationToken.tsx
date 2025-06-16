import React from 'react';
import { useFormContext } from 'react-hook-form';

import { CancelConfirmModal } from '../../../components';
import { useBeforeUnload } from '../../../utils';
import { useSurveyForm } from '../SurveyContext';

export const CancelSurveyConfirmationToken = () => {
  const { cancelModalConfirmLink, cancelModalOpen, closeCancelConfirmation, isSuccessScreen } =
    useSurveyForm();

  const { formState } = useFormContext();

  useBeforeUnload(formState.isDirty && !isSuccessScreen);

  return (
    <CancelConfirmModal
      isOpen={cancelModalOpen}
      onClose={closeCancelConfirmation}
      confirmPath={cancelModalConfirmLink}
    />
  );
};
