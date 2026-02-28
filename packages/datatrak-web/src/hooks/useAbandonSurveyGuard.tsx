import { useMatch } from 'react-router';

import { ROUTES } from '../constants';
import { useConfirmationModal } from './useConfirmationModal';

export function useAbandonSurveyGuard<T extends React.MouseEventHandler<HTMLElement>>(
  callback: T,
): ReturnType<typeof useConfirmationModal> {
  const isSurveyScreen = !!useMatch(ROUTES.SURVEY_SCREEN);
  const isSuccessScreen = !!useMatch(ROUTES.SURVEY_SUCCESS);
  const isSurveyActive = isSurveyScreen && !isSuccessScreen;

  return useConfirmationModal(callback, { bypass: !isSurveyActive });
}
