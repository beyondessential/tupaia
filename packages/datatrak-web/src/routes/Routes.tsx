import React, { Suspense } from 'react';
import { Navigate, Route, Routes as RouterRoutes } from 'react-router-dom';
import { FullPageLoader } from '@tupaia/ui-components';
import { ErrorPage } from '../views/ErrorPage';
import { LandingPage } from '../views/LandingPage';
import { LoginPage } from '../views/LoginPage';
import { LogoutPage } from '../views/LogoutPage';
import { NotAuthorisedPage } from '../views/NotAuthorisedPage';
import { OfflinePage } from '../views/OfflinePage';
import { ProjectSelectPage } from '../views/ProjectSelectPage';
import { RequestProjectAccessPage } from '../views/RequestProjectAccessPage';
import { SurveySelectPage } from '../views/SurveySelectPage';
import { TaskDetailsPage, TasksDashboardPage } from '../views/Tasks';
import { WelcomeScreens } from '../views/WelcomeScreens';
import { useCurrentUserContext } from '../api';
import { ROUTES } from '../constants';
import { useFromLocation } from '../utils';
import { SyncPage } from '../views/Sync/SyncPage';
import { CentredLayout, BackgroundPageLayout, MainPageLayout, TasksLayout } from '../layout';
import { PrivateRoute } from './PrivateRoute';
import { SurveyRoutes } from './SurveyRoutes';
import { MobileUserMenu } from '../layout/UserMenu/MobileUserMenu';

/*
 * Screens a data collector rarely (or never) opens are lazy loaded, so their code stays out of
 * the startup bundle. Each one must be imported from its concrete module (not the views barrel),
 * otherwise it would be statically reachable and the code splitting would have no effect.
 */
const AccountSettingsPage = React.lazy(() =>
  import('../views/AccountSettingsPage').then(m => ({ default: m.AccountSettingsPage })),
);
const ExportSurveyResponsePage = React.lazy(() =>
  import('../views/ExportSurveyResponsePage').then(m => ({ default: m.ExportSurveyResponsePage })),
);
const ForgotPasswordPage = React.lazy(() =>
  import('../views/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })),
);
const RegisterPage = React.lazy(() =>
  import('../views/RegisterPage').then(m => ({ default: m.RegisterPage })),
);
const ReportsPage = React.lazy(() =>
  import('../views/ReportsPage').then(m => ({ default: m.ReportsPage })),
);
const ResetPasswordPage = React.lazy(() =>
  import('../views/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })),
);
const VerifyEmailPage = React.lazy(() =>
  import('../views/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })),
);
const VerifyEmailResendPage = React.lazy(() =>
  import('../views/VerifyEmailResendPage').then(m => ({ default: m.VerifyEmailResendPage })),
);

/**
 * If the user is logged in and tries to access the auth pages, redirect them away.
 */
const AuthViewLoggedInRedirect = ({ children }) => {
  const { isLoggedIn, ...user } = useCurrentUserContext();
  const from = useFromLocation();

  if (!isLoggedIn) {
    return children;
  }

  const defaultRedirect = user.projectId ? ROUTES.HOME : ROUTES.PROJECT_SELECT;

  // When `from` is set in location state (e.g. the user was redirected here from a protected page),
  // redirect back there so they end up where they originally intended.
  return <Navigate to={from || defaultRedirect} replace={true} state={null} />;
};

/**
 * This Router is using [version 6.3]{@link https://reactrouter.com/en/v6.3.0}, as later versions are not supported by our TS setup. See [this issue here]{@link https://github.com/remix-run/react-router/discussions/8364}
 * This means the newer 'createBrowserRouter' and 'RouterProvider' can't be used here.
 **/
export const Routes = () => {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <RouterRoutes>
        <Route path={ROUTES.OFFLINE} element={<OfflinePage />} />
        <Route path={ROUTES.EXPORT_SURVEY_RESPONSE} element={<ExportSurveyResponsePage />} />

        <Route path="/" element={<MainPageLayout />}>
          <Route path={ROUTES.MOBILE_USER_MENU} element={<MobileUserMenu />} />
          {/* PRIVATE ROUTES */}
          <Route path="/" element={<PrivateRoute />}>
            <Route index element={<LandingPage />} />
            <Route path={ROUTES.WELCOME} element={<WelcomeScreens />} />
            <Route path={ROUTES.ACCOUNT_SETTINGS} element={<AccountSettingsPage />} />
            <Route element={<TasksLayout />}>
              <Route path={ROUTES.TASKS} element={<TasksDashboardPage />} />
              <Route path={ROUTES.TASK_DETAILS} element={<TaskDetailsPage />} />
            </Route>
            <Route
              path="/"
              element={<BackgroundPageLayout backgroundImage="/survey-background.svg" />}
            >
              <Route element={<CentredLayout />}>
                <Route path={ROUTES.SURVEY_SELECT} element={<SurveySelectPage />} />
              </Route>
            </Route>
            <Route
              path="/"
              element={
                <BackgroundPageLayout backgroundImage="/auth-background.svg" headerBorderHidden />
              }
            >
              <Route path="/" element={<CentredLayout />}>
                <Route path={ROUTES.PROJECT_SELECT} element={<ProjectSelectPage />} />
                <Route path={ROUTES.REQUEST_ACCESS} element={<RequestProjectAccessPage />} />
              </Route>
            </Route>
            <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
            <Route path={ROUTES.SYNC} element={<SyncPage />} />
            <Route path={ROUTES.LOGOUT} element={<LogoutPage />} />
          </Route>
          {/** Reports route is admin only so needs to be inside it's own PrivateRoute instance */}

          {/* PUBLIC ROUTES*/}
          <Route
            path="/"
            element={<BackgroundPageLayout backgroundImage="/survey-background.svg" />}
          >
            {SurveyRoutes}
          </Route>
          <Route
            path="/"
            element={
              <BackgroundPageLayout
                backgroundImage="/auth-background.svg"
                mobileBackgroundImage="/auth-background-mobile.svg"
                headerBorderHidden
              />
            }
          >
            <Route
              path="/"
              element={
                <AuthViewLoggedInRedirect>
                  <CentredLayout />
                </AuthViewLoggedInRedirect>
              }
            >
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
              <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
              <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
              <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
              <Route path={ROUTES.VERIFY_EMAIL_RESEND} element={<VerifyEmailResendPage />} />
            </Route>
          </Route>
          <Route path={ROUTES.NOT_AUTHORISED} element={<NotAuthorisedPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </RouterRoutes>
    </Suspense>
  );
};
