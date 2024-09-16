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
  exportDescriptionCharLimit: number;
  exportDescriptionCharLimitReached: boolean;
};

type ExportSettingsContextType = ExportSettings & {
  setExportFormat: (value: ExportFormats) => void;
  setExportWithLabels: (value: boolean) => void;
  setExportWithTable: (value: boolean) => void;
  setExportDescription: (value: string | null) => void;
  setExportDescriptionCharLimitReached: (value: boolean) => void;
};

const defaultContext: ExportSettingsContextType = {
  exportFormat: ExportFormats.PNG,
  exportWithLabels: false,
  exportWithTable: true,
  exportWithTableDisabled: false,
  exportDescription: null,
  exportDescriptionCharLimit: 250,
  exportDescriptionCharLimitReached: false,
  setExportFormat: () => {},
  setExportWithLabels: () => {},
  setExportWithTable: () => {},
  setExportDescription: () => {},
  setExportDescriptionCharLimitReached: () => {},
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
    exportDescriptionCharLimit,
    exportDescriptionCharLimitReached,
    setExportFormat,
    setExportWithLabels,
    setExportWithTable,
    setExportDescription,
    setExportDescriptionCharLimitReached,
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
    let value = e.target.value;
    if (value.length > exportDescriptionCharLimit) {
      value = value.slice(0, exportDescriptionCharLimit);
      setExportDescriptionCharLimitReached(true);
    } else {
      setExportDescriptionCharLimitReached(false);
    }
    setExportDescription(value);
  };

  const resetExportSettings = (dashboardItemType?: string) => {
    setExportFormat(dashboardItemType === 'matrix' ? ExportFormats.XLSX : ExportFormats.PNG);
    setExportWithLabels(false);
    setExportWithTable(true);
    setExportDescription(null);
    setExportDescriptionCharLimitReached(false);
  };

  return {
    exportFormat,
    exportWithLabels,
    exportWithTable,
    exportWithTableDisabled,
    exportDescription,
    exportDescriptionCharLimit,
    exportDescriptionCharLimitReached,
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
  const [exportDescriptionCharLimit] = useState<number>(250);
  const [exportDescriptionCharLimitReached, setExportDescriptionCharLimitReached] =
    useState<boolean>(false);

  return (
    <ExportSettingsContext.Provider
      value={{
        exportFormat,
        exportWithLabels,
        exportWithTable,
        exportWithTableDisabled,
        exportDescription,
        exportDescriptionCharLimit,
        exportDescriptionCharLimitReached,
        setExportFormat,
        setExportWithLabels,
        setExportWithTable,
        setExportDescription,
        setExportDescriptionCharLimitReached,
      }}
    >
      {children}
    </ExportSettingsContext.Provider>
  );
};
