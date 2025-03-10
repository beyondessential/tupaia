import React, { useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { LocationHeader, Toolbar, Breadcrumbs, Footer, FlexSpaceBetween } from '../components';
import { DashboardView } from './DashboardView';
import { MapView } from './MapView';
import { useEntityBreadcrumbs, useUrlParams } from '../utils';
import { LocaleMenu } from '../components/LocaleMenu';

export const EntityView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, entityCode, view } = useUrlParams();
  const { breadcrumbs, isLoading } = useEntityBreadcrumbs();

  const redirectPath = `/${locale}/${entityCode}/dashboard`;

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
          path="/dashboard"
          element={<DashboardView isOpen={isOpen} setIsOpen={setIsOpen} />}
        />
        <Route path="/map" element={<MapView />} />
        <Route path="*" element={<Navigate to={redirectPath} />} />
      </Routes>
      {view !== 'map' && <Footer />}
    </>
  );
};
