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
  separatePagePerItem: boolean;
};

type ExportSettingsContextType = ExportSettings & {
  setExportFormat: (value: ExportFormats) => void;
  setExportWithLabels: (value: boolean) => void;
  setExportWithTable: (value: boolean) => void;
  setSeparatePagePerItem: (value: boolean) => void;
};

const defaultContext = {
  exportFormat: ExportFormats.PNG,
  exportWithLabels: false,
  exportWithTable: true,
  exportWithTableDisabled: false,
  separatePagePerItem: true,
  setExportFormat: () => {},
  setExportWithLabels: () => {},
  setExportWithTable: () => {},
  setSeparatePagePerItem: () => {},
} as ExportSettingsContextType;

// This is the context for the export settings
export const ExportSettingsContext = createContext(defaultContext);

export const useExportSettings = () => {
  const {
    exportFormat,
    exportWithLabels,
    exportWithTable,
    exportWithTableDisabled,
    setExportFormat,
    setExportWithLabels,
    setExportWithTable,
    separatePagePerItem,
    setSeparatePagePerItem,
  } = useContext(ExportSettingsContext);

  const updateExportFormat = (e: ChangeEvent<HTMLInputElement>) =>
    setExportFormat(e.target.value as ExportFormats);

  const updateExportWithLabels = (e: ChangeEvent<HTMLInputElement>) => {
    setExportWithLabels(e.target.checked);
  };

  const updateExportWithTable = (e: ChangeEvent<HTMLInputElement>) => {
    setExportWithTable(e.target.checked);
  };

  const updateSeparatePagePerItem = (e: ChangeEvent<HTMLInputElement>) => {
    setSeparatePagePerItem(e.target.value === 'true');
  };

  const resetExportSettings = (dashboardItemType?: string) => {
    setExportFormat(dashboardItemType === 'matrix' ? ExportFormats.XLSX : ExportFormats.PNG);
    setExportWithLabels(false);
    setExportWithTable(true);
    setSeparatePagePerItem(true);
  };

  return {
    exportFormat,
    exportWithLabels,
    exportWithTable,
    exportWithTableDisabled,
    updateExportFormat,
    updateExportWithLabels,
    updateExportWithTable,
    resetExportSettings,
    separatePagePerItem,
    updateSeparatePagePerItem,
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
  const [exportWithTableDisabled] = useState<boolean>(
    defaultSettings?.exportWithTableDisabled || false,
  );

  const [separatePagePerItem, setSeparatePagePerItem] = useState<boolean>(
    defaultSettings?.separatePagePerItem || true,
  );

  return (
    <ExportSettingsContext.Provider
      value={{
        exportFormat,
        exportWithLabels,
        exportWithTable,
        exportWithTableDisabled,
        setExportFormat,
        setExportWithLabels,
        setExportWithTable,
        separatePagePerItem,
        setSeparatePagePerItem,
      }}
    >
      {children}
    </ExportSettingsContext.Provider>
  );
};
