/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import { Route, useMatch, Routes, Navigate } from 'react-router-dom';
import { LocationHeader, Toolbar, Breadcrumbs, Footer, FlexSpaceBetween } from '../components';
import { DashboardView } from './DashboardView';
import { MapView } from './MapView';
import { useEntityBreadcrumbs, useUrlParams } from '../utils';
import { LocaleMenu } from '../components/LocaleMenu';

export const EntityView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const match = useMatch();
  const { locale, entityCode, view } = useUrlParams();
  const { breadcrumbs, isLoading } = useEntityBreadcrumbs();

  return (
    <>
      <Toolbar>
        <FlexSpaceBetween>
          <Breadcrumbs breadcrumbs={breadcrumbs} isLoading={isLoading} />
          <LocaleMenu />
        </FlexSpaceBetween>
      </Toolbar>
      <LocationHeader setIsOpen={setIsOpen} />
      <Routes>
        <Route
          path={`${match.path}/dashboard`}
          element={<DashboardView isOpen={isOpen} setIsOpen={setIsOpen} />}
        />
        <Route path={`${match.path}/map`} element={<MapView />} />
        <Route path="*" element={<Navigate to={`/${locale}/${entityCode}/dashboard`} />} />
      </Routes>
      {view !== 'map' && <Footer />}
    </>
  );
};
