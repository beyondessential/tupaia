/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Route, useMatch, Routes } from 'react-router-dom';
import { AdminPanelDataProviders } from '@tupaia/admin-panel';
import { NavBar, Footer } from '../components';
import { HomeView } from '../views/HomeView';
import { ProfileView } from '../views/ProfileView';
import { PageView, TwoColumnPageView } from '../views/PageView';
import { EntityView } from '../views/EntityView';
import { NotFoundView } from '../views/NotFoundView';
import { LoginView } from '../views/LoginView';
import { RegisterView } from '../views/RegisterView';
import { NotAuthorisedView } from '../views/NotAuthorisedView';
import { VerifyEmailView } from '../views/VerifyEmailView';
import { ABOUT_PAGE, FQS_PAGE, CONTACT_PAGE } from '../constants';
import { ExportView, PDF_DOWNLOAD_VIEW } from '../views/ExportView';
import { getAdminApiUrl } from '../utils/getAdminApiUrl';
import AdminPanel from './AdminPanelApp';

const adminPanelConfig = { apiUrl: `${getAdminApiUrl()}` };

/**
 * Main Page Routes
 * eg. /en/LA/dashboard
 */
export const PageRoutes = React.memo(() => {
  const { path } = useMatch();

  return (
    <Routes>
      <Route
        exact
        path={`${path}/`}
        element={
          <>
            <NavBar hideSearch />
            <HomeView />
          </>
        }
      />
      <Route path={`${path}/login`} element={<LoginView />} />

      <Route path={`${path}/verify-email`} element={<VerifyEmailView />} />

      <Route path={`${path}/register`} element={<RegisterView />} />

      <Route
        path={`${path}/profile`}
        element={
          <>
            <NavBar />
            <ProfileView />
            <Footer />
          </>
        }
      />

      <Route
        path={`${path}/admin`}
        element={
          <AdminPanelDataProviders config={adminPanelConfig}>
            <AdminPanel />
          </AdminPanelDataProviders>
        }
      />
      <Route
        path={`${path}/about`}
        element={
          <>
            <NavBar />
            <PageView content={ABOUT_PAGE} />
            <Footer />
          </>
        }
      />
      <Route
        path={`${path}/fundamental-quality-standards`}
        element={
          <>
            {' '}
            <NavBar />
            <TwoColumnPageView content={FQS_PAGE} />
            <Footer />
          </>
        }
      />

      <Route
        path={`${path}/contact`}
        element={
          <>
            <NavBar />
            <PageView content={CONTACT_PAGE} />
            <Footer />
          </>
        }
      />

      <Route
        path={`${path}/page-not-found`}
        element={
          <>
            <NavBar />
            <NotFoundView />
            <Footer />
          </>
        }
      />
      <Route
        path={`${path}/not-authorised`}
        element={
          <>
            <NavBar />
            <NotAuthorisedView />
            <Footer />
          </>
        }
      />
      <Route
        path={`${path}/pdf-export/:entityCode?`}
        element={<ExportView viewType={PDF_DOWNLOAD_VIEW} />}
      />
      <Route
        path={`${path}/:entityCode/:view?`}
        element={
          <>
            <NavBar />
            <EntityView />
          </>
        }
      />
    </Routes>
  );
});
