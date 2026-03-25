import React, { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { ConfirmationModal } from '../../../components';
import { useBeforeUnload } from '../../../utils';
import { SurveyParams } from '../../../types';
import { useIsSuccessScreen } from '../routes';
import { useSaveAsDraft } from '../hooks/useSaveAsDraft';
import { useNavigationBlocker } from '../../../utils';

export const CancelSurveyConfirmationToken = () => {
  const isSuccessScreen = useIsSuccessScreen();
  const { countryCode, surveyCode } = useParams<SurveyParams>();

  const { formState } = useFormContext();
  const { saveAsDraft } = useSaveAsDraft();

  const isActive = formState.isDirty && !isSuccessScreen;

  useBeforeUnload(isActive);

  const [isOpen, setIsOpen] = useState(false);

  const handleBlock = () => {
    setIsOpen(true);
  };

  // Allow navigation within the current survey (e.g. next/back between screens)
  const surveyBasePath = `/survey/${countryCode}/${surveyCode}`;
  const shouldBlock = useCallback(
    (pathname: string) => !pathname.startsWith(surveyBasePath),
    [surveyBasePath],
  );

  const { proceed, reset } = useNavigationBlocker({
    active: isActive,
    onBlock: handleBlock,
    shouldBlock,
  });

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
    await saveAsDraft();
    // Navigate to the originally blocked destination (e.g. account settings, logout)
    proceed();
  }, [saveAsDraft, proceed]);

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={handleClose}
      onCancel={handleCancel}
      onConfirm={handleSaveDraft}
      heading="Survey in progress"
      description="If you exit, you will lose the progress you’ve made on the current survey. Would you like to save as a draft or exit without saving?"
      confirmLabel="Save draft"
      cancelLabel="Exit without saving"
    />
  );
};
