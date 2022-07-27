import { refreshBrowserWhenFinishingUserSession } from './refreshBrowserWhenFinishingUserSession';
import { watchAttemptChangePasswordAndFetchIt } from './watchAttemptChangePasswordAndFetchIt';
import { watchAttemptRequestCountryAccessAndFetchIt } from './watchAttemptRequestCountryAccessAndFetchIt';
import { watchAttemptResetPasswordAndFetchIt } from './watchAttemptResetPasswordAndFetchIt';
import { watchAttemptTokenLogin } from './watchAttemptTokenLogin';
import { watchAttemptTokenLoginSuccess } from './watchAttemptTokenLoginSuccess';
import { watchAttemptUserLoginAndFetchIt } from './watchAttemptUserLoginAndFetchIt';
import { watchAttemptUserLogout } from './watchAttemptUserLogout';
import { watchAttemptUserSignupAndFetchIt } from './watchAttemptUserSignupAndFetchIt';
import { watchChangeOrgUnitSuccess } from './watchChangeOrgUnitSuccess';
import { watchFetchCountryAccessDataAndFetchIt } from './watchFetchCountryAccessDataAndFetchIt';
import { watchFetchInitialData } from './watchFetchInitialData';
import { watchFetchMeasureSuccess } from './watchFetchMeasureSuccess';
import { watchFetchMoreSearchResults } from './watchFetchMoreSearchResults';
import { watchFetchNewEnlargedDialogData } from './watchFetchNewEnlargedDialogData';
import { watchFetchResetTokenLoginSuccess } from './watchFetchResetTokenLoginSuccess';
import { watchFindUserCurrentLoggedIn } from './watchFindUserCurrentLoggedIn';
import { watchGoHomeAndResetToProjectSplash } from './watchGoHomeAndResetToProjectSplash';
import { watchHandleLocationChange } from './watchHandleLocationChange';
import { watchLoginSuccess } from './watchLoginSuccess';
import { watchLogoutSuccess } from './watchLogoutSuccess';
import { watchOrgUnitChangeAndFetchDashboard } from './watchOrgUnitChangeAndFetchDashboard';
import { watchOrgUnitChangeAndFetchIt } from './watchOrgUnitChangeAndFetchIt';
import { watchOrgUnitChangeAndFetchMeasureInfo } from './watchOrgUnitChangeAndFetchMeasureInfo';
import { watchOrgUnitChangeAndFetchMeasures } from './watchOrgUnitChangeAndFetchMeasures';
import { watchOverlayPeriodChange } from './watchOverlayPeriodChange';
import { watchRequestOrgUnitAndFetchIt } from './watchRequestOrgUnitAndFetchIt';
import { watchRequestProjectAccess } from './watchRequestProjectAccess';
import { watchResendEmailVerificationAndFetchIt } from './watchResendEmailVerificationAndFetchIt';
import { watchSearchChange } from './watchSearchChange';
import { watchSetMapOverlayChange } from './watchSetMapOverlayChange';
import { watchSetMapOverlaysOnceHierarchyLoads } from './watchSetMapOverlaysOnceHierarchyLoads';
import { watchSetVerifyEmailToken } from './watchSetVerifyEmailToken';
import { watchViewFetchRequests } from './watchViewFetchRequests';

export default [
  watchFetchInitialData,
  watchAttemptChangePasswordAndFetchIt,
  watchAttemptResetPasswordAndFetchIt,
  watchAttemptTokenLoginSuccess,
  watchAttemptRequestCountryAccessAndFetchIt,
  watchAttemptUserLoginAndFetchIt,
  watchAttemptUserLogout,
  watchAttemptUserSignupAndFetchIt,
  watchFetchCountryAccessDataAndFetchIt,
  watchRequestOrgUnitAndFetchIt,
  watchOrgUnitChangeAndFetchIt,
  watchOrgUnitChangeAndFetchDashboard,
  watchOrgUnitChangeAndFetchMeasureInfo,
  watchViewFetchRequests,
  watchSearchChange,
  watchFetchMoreSearchResults,
  watchSetMapOverlayChange,
  watchOrgUnitChangeAndFetchMeasures,
  watchFindUserCurrentLoggedIn,
  watchFetchNewEnlargedDialogData,
  watchLoginSuccess,
  watchLogoutSuccess,
  watchAttemptTokenLogin,
  watchResendEmailVerificationAndFetchIt,
  watchSetVerifyEmailToken,
  watchFetchMeasureSuccess,
  watchChangeOrgUnitSuccess,
  refreshBrowserWhenFinishingUserSession,
  watchRequestProjectAccess,
  watchGoHomeAndResetToProjectSplash,
  watchFetchResetTokenLoginSuccess,
  watchOverlayPeriodChange,
  watchSetMapOverlaysOnceHierarchyLoads,
  watchHandleLocationChange,
];
