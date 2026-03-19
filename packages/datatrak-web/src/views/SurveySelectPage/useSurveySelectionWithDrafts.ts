import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Country, KeysToCamelCase } from '@tupaia/types';
import { useSurveyResponseDrafts } from '../../api/queries/useSurveyResponseDrafts';
import { Survey } from '../../types';
import { NavigateToSurveyType } from './SurveySelectPage';

const getDraftsForSurvey = (
  allDrafts: ReturnType<typeof useSurveyResponseDrafts>['data'],
  countryCode?: string,
  surveyCode?: string | null,
) => (allDrafts ?? []).filter(
  draft => draft.surveyCode === surveyCode && draft.countryCode === countryCode,
);

/**
 * Manages draft-detection when selecting a survey.
 * Returns modal props and a wrapped `handleSelectSurvey` that shows the modal
 * when a matching draft exists, or navigates directly otherwise.
 */
export const useSurveySelectionWithDrafts = (
  selectedCountry: KeysToCamelCase<Country> | null | undefined,
  selectedSurvey: Survey['code'] | null,
  setSelectedSurvey: (code: Survey['code'] | null) => void,
  navigateToSurvey: NavigateToSurveyType,
) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { data: allDrafts = [], isLoading: isDraftsLoading } = useSurveyResponseDrafts();

  const matchingDrafts = getDraftsForSurvey(allDrafts, selectedCountry?.code, selectedSurvey);
  const firstDraft = matchingDrafts[0];
  const resumePath = firstDraft
    ? `/survey/${firstDraft.countryCode}/${firstDraft.surveyCode}/${firstDraft.screenNumber ?? 0}?draftId=${firstDraft.id}`
    : '';

  const handleSelectSurvey: NavigateToSurveyType = (country, surveyCode) => {
    // Don't navigate until drafts have loaded — otherwise we'd skip the
    // draft-exists modal because allDrafts defaults to [].
    if (isDraftsLoading) return;

    const draftsForSurvey = getDraftsForSurvey(allDrafts, country?.code, surveyCode);

    if (draftsForSurvey.length > 0) {
      setSelectedSurvey(surveyCode);
      setIsOpen(true);
      return;
    }

    navigateToSurvey(country, surveyCode);
  };

  const draftModalProps = {
    isOpen,
    onClose: () => setIsOpen(false),
    onStartNew: () => {
      setIsOpen(false);
      navigateToSurvey(selectedCountry, selectedSurvey);
    },
    onResume: () => {
      if (resumePath) {
        setIsOpen(false);
        navigate(resumePath);
      } else {
        setIsOpen(false);
      }
    },
  };

  return { draftModalProps, handleSelectSurvey, isDraftsLoading };
};
