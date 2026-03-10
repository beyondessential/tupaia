export * from './date';
export * from './detectDevice';
export { isWebApp } from './displayMode';
export { formatNumberWithTrueMinus, formatFraction } from './formatNumbers';
export { gaEvent } from './ga';
export { innerText } from './innerText';
export {
  useIsDesktopSizeClass as useIsDesktop,
  useIsMobileSizeClass as useIsMobile,
} from './sizeClasses';
export { errorToast, infoToast, successToast } from './toast';
export {
  addRecentSurvey,
  clearRecentSurveys,
  formatSurveySearchQuery,
  getRecentSurveys,
  getRecentSurveysForCountry,
} from './surveyHistory';
export type { RecentSurvey } from './surveyHistory';
export { useBeforeUnload } from './useBeforeUnload';
export { useHasVideoInput } from './useHasVideoInput';
export { useFromLocation } from './useLocationState';
export { formatEntityForResponse, formatEntitiesForResponse } from './formatEntity';
export type { ExtendedEntityFieldName } from './formatEntity';
