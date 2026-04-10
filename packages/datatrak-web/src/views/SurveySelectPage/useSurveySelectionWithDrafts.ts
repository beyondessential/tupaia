import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Country, KeysToCamelCase } from '@tupaia/types';
import { Survey } from '../../types';
import { useDraftExistsModal } from '../../features/Survey/hooks/useDraftExistsModal';
import { NavigateToSurveyType } from './SurveySelectPage';

/**
 * Manages draft-detection when selecting a survey on the SurveySelectPage.
 * Returns modal props and a wrapped `handleSelectSurvey` that shows the modal
 * when a matching draft exists, or navigates directly otherwise.
 */
export const useSurveySelectionWithDrafts = (
  setSelectedSurvey: (code: Survey['code'] | null) => void,
  navigateToSurvey: NavigateToSurveyType,
) => {
  const navigate = useNavigate();
  // Store the country that triggered the modal so onStartNew uses the exact
  // same value rather than relying on a potentially-stale closure.
  const pendingCountryRef = useRef<KeysToCamelCase<Country> | null | undefined>(null);

  const { checkForDrafts, draftModalProps, isDraftsLoading } = useDraftExistsModal({
    onStartNew: (_countryCode, surveyCode) =>
      navigateToSurvey(pendingCountryRef.current, surveyCode),
    onResume: resumePath => navigate(resumePath),
  });

  const handleSelectSurvey: NavigateToSurveyType = (country, surveyCode) => {
    // Don't navigate or mutate state until drafts have loaded — otherwise
    // we'd skip the draft-exists modal because allDrafts defaults to [].
    if (isDraftsLoading) return;

    if (checkForDrafts(country?.code, surveyCode)) {
      pendingCountryRef.current = country;
      setSelectedSurvey(surveyCode);
      return;
    }

    navigateToSurvey(country, surveyCode);
  };

  return { draftModalProps, handleSelectSurvey, isDraftsLoading };
};
