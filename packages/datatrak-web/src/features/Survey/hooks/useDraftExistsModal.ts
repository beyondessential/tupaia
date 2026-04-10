import { useState } from 'react';
import { useSurveyResponseDrafts } from '../../../api/queries/useSurveyResponseDrafts';

interface DraftExistsHandlers {
  /** Called when the user chooses "Start new survey". Receives the countryCode and surveyCode that triggered the modal. */
  onStartNew: (countryCode: string, surveyCode: string) => void;
  /** Called when the user chooses "Continue existing draft". Receives the resume path including draftId. */
  onResume: (resumePath: string) => void;
}

/**
 * Core hook for draft-exists modal logic.
 * Call `checkForDrafts(countryCode, surveyCode)` before navigating to a survey.
 * Returns `true` if a draft was found (modal shown) or drafts are still loading, `false` otherwise.
 */
export const useDraftExistsModal = ({ onStartNew, onResume }: DraftExistsHandlers) => {
  const { data: allDrafts = [], isLoading: isDraftsLoading } = useSurveyResponseDrafts();
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
      resumePath: `/survey/${firstDraft.countryCode}/${firstDraft.surveyCode}/${firstDraft.screenNumber ?? 1}?draftId=${firstDraft.id}`,
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
      if (state.resumePath) onResume(state.resumePath);
    },
  };

  return { checkForDrafts, draftModalProps, isDraftsLoading };
};
