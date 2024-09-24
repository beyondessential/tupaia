/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { ChangeEvent, createContext, useContext, useState } from 'react';

export enum ExportFormats {
  PNG = 'png',
  XLSX = 'xlsx',
}

type ExportSettings = {
  exportFormat: ExportFormats;
  exportWithLabels: boolean;
  exportWithTable: boolean;
  exportWithTableDisabled: boolean;
  exportDescription: string | null;
};

type ExportSettingsContextType = ExportSettings & {
  setExportFormat: (value: ExportFormats) => void;
  setExportWithLabels: (value: boolean) => void;
  setExportWithTable: (value: boolean) => void;
  setExportDescription: (value: string | null) => void;
};

const defaultContext: ExportSettingsContextType = {
  exportFormat: ExportFormats.PNG,
  exportWithLabels: false,
  exportWithTable: true,
  exportWithTableDisabled: false,
  exportDescription: null,
  setExportFormat: () => {},
  setExportWithLabels: () => {},
  setExportWithTable: () => {},
  setExportDescription: () => {},
};

// This is the context for the export settings
export const ExportSettingsContext = createContext<ExportSettingsContextType>(defaultContext);

export const useExportSettings = () => {
  const {
    exportFormat,
    exportWithLabels,
    exportWithTable,
    exportWithTableDisabled,
    exportDescription,
    setExportFormat,
    setExportWithLabels,
    setExportWithTable,
    setExportDescription,
  } = useContext(ExportSettingsContext);

  const updateExportFormat = (e: ChangeEvent<HTMLInputElement>) =>
    setExportFormat(e.target.value as ExportFormats);

  const updateExportWithLabels = (e: ChangeEvent<HTMLInputElement>) => {
    setExportWithLabels(e.target.checked);
  };

  const updateExportWithTable = (e: ChangeEvent<HTMLInputElement>) => {
    setExportWithTable(e.target.checked);
  };

  const updateExportDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setExportDescription(e.target.value);
  };

  const resetExportSettings = (dashboardItemType?: string) => {
    setExportFormat(dashboardItemType === 'matrix' ? ExportFormats.XLSX : ExportFormats.PNG);
    setExportWithLabels(false);
    setExportWithTable(true);
    setExportDescription(null);
  };

  return {
    exportFormat,
    exportWithLabels,
    exportWithTable,
    exportWithTableDisabled,
    exportDescription,
    updateExportFormat,
    updateExportWithLabels,
    updateExportWithTable,
    updateExportDescription,
    resetExportSettings,
  };
};

export const ExportSettingsContextProvider = ({
  defaultSettings,
  children,
}: {
  defaultSettings?: ExportSettings;
  children: React.ReactNode;
}) => {
  const [exportFormat, setExportFormat] = useState<ExportFormats>(
    defaultSettings?.exportFormat || ExportFormats.PNG,
  );
  const [exportWithLabels, setExportWithLabels] = useState<boolean>(
    defaultSettings?.exportWithLabels || false,
  );
  const [exportWithTable, setExportWithTable] = useState<boolean>(
    defaultSettings?.exportWithTable || true,
  );
  const [exportDescription, setExportDescription] = useState<string | null>(
    defaultSettings?.exportDescription || null,
  );
  const [exportWithTableDisabled] = useState<boolean>(
    defaultSettings?.exportWithTableDisabled || false,
  );

  return (
    <ExportSettingsContext.Provider
      value={{
        exportFormat,
        exportWithLabels,
        exportWithTable,
        exportWithTableDisabled,
        exportDescription,
        setExportFormat,
        setExportWithLabels,
        setExportWithTable,
        setExportDescription,
      }}
    >
      {children}
    </ExportSettingsContext.Provider>
  );
};
