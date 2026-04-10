import { Country, KeysToCamelCase } from '@tupaia/types';
import { Survey } from '../../types';
import { NavigateToSurveyType } from './SurveySelectPage';
import { useDraftExistsModal } from './useDraftExistsModal';

/**
 * Manages draft-detection when selecting a survey on the SurveySelectPage.
 * Returns modal props and a wrapped `handleSelectSurvey` that shows the modal
 * when a matching draft exists, or navigates directly otherwise.
 */
export const useSurveySelectionWithDrafts = (
  selectedCountry: KeysToCamelCase<Country> | null | undefined,
  setSelectedSurvey: (code: Survey['code'] | null) => void,
  navigateToSurvey: NavigateToSurveyType,
) => {
  const { checkForDrafts, draftModalProps, isDraftsLoading } = useDraftExistsModal(
    (_countryCode, surveyCode) => navigateToSurvey(selectedCountry, surveyCode),
  );

  const handleSelectSurvey: NavigateToSurveyType = (country, surveyCode) => {
    if (checkForDrafts(country?.code, surveyCode)) {
      setSelectedSurvey(surveyCode);
      return;
    }

    navigateToSurvey(country, surveyCode);
  };

  return { draftModalProps, handleSelectSurvey, isDraftsLoading };
};
