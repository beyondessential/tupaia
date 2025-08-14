import React from 'react';
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';
import { PageRoutes } from './routes/PageRoutes';
import { DEFAULT_LOCALE, LOCALES } from './constants';

const loadLocale = () => {
  const { pathname } = window.location;

  // Load the locale from the url if it is set
  const urlLocale = pathname.split('/')[1];

  if (LOCALES.includes(urlLocale)) {
    window.localStorage.setItem('lesmis-locale', urlLocale);
    return urlLocale;
  }

  return window.localStorage.getItem('lesmis-locale') || DEFAULT_LOCALE;
};

export const App = () => {
  const locale = loadLocale();

  return (
    <Router>
      <Routes>
        <Route path="/:locale/*" element={<PageRoutes />} />
        <Route path="/" element={<Navigate to={`/${locale}`} replace />} />
      </Routes>
    </Router>
  );
};
