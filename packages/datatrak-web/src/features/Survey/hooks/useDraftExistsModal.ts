import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyResponseDrafts } from '../../../api/queries/useSurveyResponseDrafts';

/**
 * Core hook for draft-exists modal logic.
 * Call `checkForDrafts(countryCode, surveyCode)` before navigating to a survey.
 * Returns `true` if a draft was found (modal shown) or drafts are still loading, `false` otherwise.
 *
 * @param onStartNew Called when the user chooses "Start new survey" in the modal.
 *                   Receives the countryCode and surveyCode that triggered the modal.
 */
export const useDraftExistsModal = (
  onStartNew: (countryCode: string, surveyCode: string) => void,
) => {
  const { data: allDrafts = [], isLoading: isDraftsLoading } = useSurveyResponseDrafts();
  const navigate = useNavigate();
  const [state, setState] = useState<{
    isOpen: boolean;
    countryCode?: string;
    surveyCode?: string;
    resumePath?: string;
  }>({ isOpen: false });

  const checkForDrafts = (countryCode?: string, surveyCode?: string | null): boolean => {
    if (isDraftsLoading) return true;
    const drafts = allDrafts.filter(
      d => d.surveyCode === surveyCode && d.countryCode === countryCode,
    );
    if (drafts.length === 0) return false;

    const firstDraft = drafts[0];
    setState({
      isOpen: true,
      countryCode,
      surveyCode: surveyCode ?? undefined,
      resumePath: `/survey/${firstDraft.countryCode}/${firstDraft.surveyCode}/${firstDraft.screenNumber ?? 0}?draftId=${firstDraft.id}`,
    });
    return true;
  };

  const close = () => setState({ isOpen: false });

  const draftModalProps = {
    isOpen: state.isOpen,
    onClose: close,
    onStartNew: () => {
      close();
      if (state.countryCode && state.surveyCode) {
        onStartNew(state.countryCode, state.surveyCode);
      }
    },
    onResume: () => {
      close();
      if (state.resumePath) navigate(state.resumePath);
    },
  };

  return { checkForDrafts, draftModalProps, isDraftsLoading };
};
