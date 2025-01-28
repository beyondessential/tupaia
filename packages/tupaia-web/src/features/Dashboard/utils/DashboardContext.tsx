import React, { createContext, useState } from 'react';

type DashboardStateType = {
  exportModalOpen: boolean;
  subscribeModalOpen: boolean;
  setExportModalOpen: (value: boolean) => void;
  setSubscribeModalOpen: (value: boolean) => void;
};

const defaultState = {
  exportModalOpen: false,
  subscribeModalOpen: false,
  setExportModalOpen: () => {},
  setSubscribeModalOpen: () => {},
} as DashboardStateType;

export const DashboardContext = createContext(defaultState);

// A wrapper containing the context providers for the dashboard
export const DashboardContextProvider = ({ children }) => {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  return (
    <DashboardContext.Provider
      value={{
        exportModalOpen,
        subscribeModalOpen,
        setExportModalOpen,
        setSubscribeModalOpen,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
