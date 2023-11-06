/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { createContext, useState, useContext } from 'react';

type MapOverlayDateRange = string;

type MapOverlaySelectorContextType = {
  setMapOverlayDateRange: (code: string, dateRange: MapOverlayDateRange) => void;
  getMapOverlayDateRange: (code: string) => MapOverlayDateRange | void;
};

const initialContext: MapOverlaySelectorContextType = {
  getMapOverlayDateRange: () => {},
  setMapOverlayDateRange: () => {},
};

const MapOverlaySelectorContext = createContext<MapOverlaySelectorContextType>(initialContext);

export const MapOverlaySelectorContextProvider = ({ children }) => {
  const [datesByMapOverlay, setDatesByMapOverlay] = useState({});

  const setMapOverlayDateRange = (code: string, dateRange: MapOverlayDateRange) => {
    setDatesByMapOverlay({
      ...datesByMapOverlay,
      [code]: dateRange,
    });
  };

  const getMapOverlayDateRange = (code: string) => datesByMapOverlay[code];

  console.log('datesByMapOverlay', datesByMapOverlay);

  return (
    <MapOverlaySelectorContext.Provider value={{ getMapOverlayDateRange, setMapOverlayDateRange }}>
      {children}
    </MapOverlaySelectorContext.Provider>
  );
};

export const useMapOverlaySelectorContext = () => {
  const context = useContext(MapOverlaySelectorContext);
  if (context === undefined) {
    throw new Error('useMapOverlay must be used within a MapOverlayProvider');
  }
  return context;
};
