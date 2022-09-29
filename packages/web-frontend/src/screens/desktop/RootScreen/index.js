/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

/**
 * RootScreen
 *
 * Bare bones container that renders the map fixed in the background and controls vertical ratios
 * of Dashboard and MapDiv based on expanded state of Dashboard (through redux store)
 */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainPage from './MainPage';
import PDFExportPage from './PDFExportPage';

const RootScreen = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path=":projectCode/:countryCode/:dashboardCode/:pdfExportType"
          element={<PDFExportPage />}
        />
        <Route path="*" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RootScreen;
