/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { Dispatch, createContext, useReducer } from 'react';

type ExportReducerState = {
  isExporting: boolean;
  isExportMode: boolean;
  exportError: string | null;
};
const defaultContext = {
  isExporting: false,
  isExportMode: false,
  exportError: null,
} as ExportReducerState;

// This is the context for the export status
export const ExportDashboardItemContext = createContext(defaultContext);

export enum ExportDashboardItemActionTypes {
  SET_IS_EXPORTING = 'SET_IS_EXPORTING',
  SET_IS_EXPORT_MODE = 'SET_IS_EXPORT_MODE',
  SET_EXPORT_ERROR = 'SET_EXPORT_ERROR',
  RESET_EXPORT_STATE = 'RESET_EXPORT_STATE',
}

interface ExportAction {
  type: ExportDashboardItemActionTypes;
  payload?: boolean | string | null;
}

export const ExportDashboardItemDispatchContext = createContext<Dispatch<ExportAction> | null>(
  null,
);

export const exportDashboardItemReducer = (
  state: ExportReducerState,
  action: ExportAction,
): ExportReducerState => {
  switch (action.type) {
    case ExportDashboardItemActionTypes.SET_IS_EXPORTING:
      return {
        ...state,
        isExporting: action.payload as boolean,
      };
    case ExportDashboardItemActionTypes.SET_IS_EXPORT_MODE:
      return {
        ...state,
        isExportMode: action.payload as boolean,
      };
    case ExportDashboardItemActionTypes.SET_EXPORT_ERROR:
      return {
        ...state,
        exportError: action.payload as string | null,
      };
    case ExportDashboardItemActionTypes.RESET_EXPORT_STATE:
      return {
        ...state,
        isExporting: false,
        isExportMode: false,
        exportError: null,
      };
    default:
      return state;
  }
};

export const ExportDashboardItemContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(exportDashboardItemReducer, defaultContext);
  return (
    <ExportDashboardItemContext.Provider value={state}>
      <ExportDashboardItemDispatchContext.Provider value={dispatch}>
        {children}
      </ExportDashboardItemDispatchContext.Provider>
    </ExportDashboardItemContext.Provider>
  );
};
