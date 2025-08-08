import React, { createContext, useState } from 'react';

interface DashboardStateType {
  exportModalOpen: boolean;
  subscribeModalOpen: boolean;
  setExportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSubscribeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const defaultState: DashboardStateType = {
  exportModalOpen: false,
  subscribeModalOpen: false,
  setExportModalOpen: () => {},
  setSubscribeModalOpen: () => {},
};

export const DashboardContext = createContext<DashboardStateType>(defaultState);

// A wrapper containing the context providers for the dashboard
export const DashboardContextProvider = ({ children }: { children: Readonly<React.ReactNode> }) => {
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
