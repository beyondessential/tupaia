import React, { createContext, useState } from 'react';
import { ExportSettingsContextProvider } from '../../ExportSettings';

type ExportDashboardItemStateType = {
  isExporting: boolean;
  isExportMode: boolean;
  exportError: string | null;
  setExportError: (value: string | null) => void;
  setIsExporting: (value: boolean) => void;
  setIsExportMode: (value: boolean) => void;
};
const defaultContext = {
  isExporting: false,
  isExportMode: false,
  exportError: null,
  setExportError: () => {},
  setIsExporting: () => {},
  setIsExportMode: () => {},
} as ExportDashboardItemStateType;

// This is the context for the export status
export const ExportDashboardItemContext = createContext(defaultContext);

export const ExportDashboardItemContextProvider = ({ children, defaultSettings }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportMode, setIsExportMode] = useState(false);
  const [exportError, setExportError] = useState<ExportDashboardItemStateType['exportError']>(null);
  return (
    <ExportSettingsContextProvider defaultSettings={defaultSettings}>
      <ExportDashboardItemContext.Provider
        value={{
          isExporting,
          isExportMode,
          exportError,
          setExportError,
          setIsExporting,
          setIsExportMode,
        }}
      >
        {children}
      </ExportDashboardItemContext.Provider>
    </ExportSettingsContextProvider>
  );
};
