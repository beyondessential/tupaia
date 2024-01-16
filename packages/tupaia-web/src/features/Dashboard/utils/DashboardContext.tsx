/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { createContext, useState } from 'react';

type DashboardStateType = {
  selectedDashboardItems: string[];
  exportModalOpen: boolean;
  subscribeModalOpen: boolean;
  setSelectedDashboardItems: (value: string[]) => void;
  setExportModalOpen: (value: boolean) => void;
  setSubscribeModalOpen: (value: boolean) => void;
};

const defaultState = {
  selectedDashboardItems: [],
  exportModalOpen: false,
  subscribeModalOpen: false,
  setSelectedDashboardItems: () => {},
  setExportModalOpen: () => {},
  setSubscribeModalOpen: () => {},
} as DashboardStateType;

export const DashboardContext = createContext(defaultState);

// A wrapper containing the context providers for the dashboard
export const DashboardContextProvider = ({ children }) => {
  const [selectedDashboardItems, setSelectedDashboardItems] = useState<string[]>([]);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  return (
    <DashboardContext.Provider
      value={{
        selectedDashboardItems,
        exportModalOpen,
        subscribeModalOpen,
        setSelectedDashboardItems,
        setExportModalOpen,
        setSubscribeModalOpen,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
