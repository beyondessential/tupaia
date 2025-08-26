import { Map } from 'leaflet';
import React, { createContext, useContext, useState } from 'react';

const MapContext = createContext<{
  map: Map | null;
  setMap: React.Dispatch<React.SetStateAction<Map | null>>;
}>({
  map: null,
  setMap: () => {},
});

/**
 * This is a context for the leaflet map. It is a workaround for the fact that we can't use react-leaflet's `useMap` inside the map overlay selector because the selector needs to be rendered outside of the map component to avoid interfering with the map's mouse events.
 */
export const MapContextProvider = ({ children }: { children: Readonly<React.ReactNode> }) => {
  const [map, setMap] = useState<Map | null>(null);

  return <MapContext.Provider value={{ map, setMap }}>{children}</MapContext.Provider>;
};

export const useMapContext = () => useContext(MapContext);
