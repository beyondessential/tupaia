import React, { ReactNode, useContext } from 'react';
import { Map } from 'leaflet';
import { createContext, useState } from 'react';

const defaultMapContext = {
  map: null,
  setMap: () => {},
} as {
  map: Map | null;
  setMap: (map: Map | null) => void;
};

const MapContext = createContext(defaultMapContext);

/**
 * This is a context for the leaflet map. It is a workaround for the fact that we can't use react-leaflet's `useMap` inside the map overlay selector because the selector needs to be rendered outside of the map component to avoid interfering with the map's mouse events.
 */
export const MapContextProvider = ({ children }: { children: ReactNode }) => {
  const [map, setMap] = useState<Map | null>(null);

  return <MapContext.Provider value={{ map, setMap }}>{children}</MapContext.Provider>;
};

export const useMapContext = () => useContext(MapContext);
