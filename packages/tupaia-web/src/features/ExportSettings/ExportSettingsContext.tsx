/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { ChangeEvent, Dispatch, createContext, useContext, useReducer } from 'react';

export enum ExportFormats {
  PNG = 'png',
  XLSX = 'xlsx',
}

type ExportSettingsReducerState = {
  exportFormat: ExportFormats;
  exportWithLabels: boolean;
  exportWithTable: boolean;
  exportWithTableDisabled?: boolean;
};
const defaultContext = {
  exportFormat: ExportFormats.PNG,
  exportWithLabels: false,
  exportWithTable: true,
  exportWithTableDisabled: false,
} as ExportSettingsReducerState;

// This is the context for the export settings
export const ExportSettingsContext = createContext(defaultContext);

export enum ExportSettingsActionTypes {
  SET_EXPORT_FORMAT = 'SET_EXPORT_FORMAT',
  SET_EXPORT_WITH_LABELS = 'SET_EXPORT_WITH_LABELS',
  SET_EXPORT_WITH_TABLE = 'SET_EXPORT_WITH_TABLE',
  RESET_EXPORT_STATE = 'RESET_EXPORT_STATE',
}

interface ActionT {
  type: ExportSettingsActionTypes;
  payload?: boolean | ExportFormats | string | null;
}

export const ExportSettingsDispatchContext = createContext<Dispatch<ActionT> | null>(null);

export const exportSettingsReducer = (
  state: ExportSettingsReducerState,
  action: ActionT,
): ExportSettingsReducerState => {
  switch (action.type) {
    case ExportSettingsActionTypes.SET_EXPORT_FORMAT:
      return {
        ...state,
        exportFormat: action.payload as ExportFormats,
      };
    case ExportSettingsActionTypes.SET_EXPORT_WITH_LABELS:
      return {
        ...state,
        exportWithLabels: action.payload as boolean,
      };
    case ExportSettingsActionTypes.SET_EXPORT_WITH_TABLE:
      return {
        ...state,
        exportWithTable: action.payload as boolean,
      };
    case ExportSettingsActionTypes.RESET_EXPORT_STATE:
      return {
        ...state,
        exportFormat: action.payload === 'matrix' ? ExportFormats.XLSX : ExportFormats.PNG,
        exportWithLabels: false,
        exportWithTable: true,
        exportWithTableDisabled: false,
      };
    default:
      return state;
  }
};

export const useExportSettings = () => {
  const { exportFormat, exportWithLabels, exportWithTable, exportWithTableDisabled } =
    useContext(ExportSettingsContext);
  const dispatch = useContext(ExportSettingsDispatchContext);

  const setExportFormat = (e: ChangeEvent<HTMLInputElement>) =>
    dispatch?.({
      type: ExportSettingsActionTypes.SET_EXPORT_FORMAT,
      payload: e.target.value,
    });

  const setExportWithLabels = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch?.({
      type: ExportSettingsActionTypes.SET_EXPORT_WITH_LABELS,
      payload: e.target.checked,
    });
  };

  const setExportWithTable = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch?.({
      type: ExportSettingsActionTypes.SET_EXPORT_WITH_TABLE,
      payload: e.target.checked,
    });
  };

  return {
    exportFormat,
    exportWithLabels,
    exportWithTable,
    exportWithTableDisabled,
    setExportFormat,
    setExportWithLabels,
    setExportWithTable,
  };
};

export const ExportSettingsContextProvider = ({ defaultSettings, children }) => {
  const [state, dispatch] = useReducer(exportSettingsReducer, {
    ...defaultContext,
    ...defaultSettings,
  });
  return (
    <ExportSettingsContext.Provider value={state}>
      <ExportSettingsDispatchContext.Provider value={dispatch}>
        {children}
      </ExportSettingsDispatchContext.Provider>
    </ExportSettingsContext.Provider>
  );
};
