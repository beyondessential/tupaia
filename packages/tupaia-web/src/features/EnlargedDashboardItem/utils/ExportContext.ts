/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Dispatch, createContext } from 'react';

export enum EXPORT_FORMATS {
  PNG = 'png',
  XLSX = 'xlsx',
}

type ExportReducerState = {
  isExporting: boolean;
  isExportMode: boolean;
  exportError: string | null;
  exportFormat: EXPORT_FORMATS;
  exportWithLabels: boolean;
  exportWithTable: boolean;
  exportWithTableDisabled: boolean;
};
const defaultContext = {
  isExporting: false,
  isExportMode: false,
  exportError: null,
  exportFormat: EXPORT_FORMATS.PNG,
  exportWithLabels: false,
  exportWithTable: true,
  exportWithTableDisabled: false,
} as ExportReducerState;

// This is the context for the export status
export const ExportContext = createContext(defaultContext);

export enum ACTION_TYPES {
  SET_IS_EXPORTING = 'SET_IS_EXPORTING',
  SET_IS_EXPORT_MODE = 'SET_IS_EXPORT_MODE',
  SET_EXPORT_ERROR = 'SET_EXPORT_ERROR',
  SET_EXPORT_FORMAT = 'SET_EXPORT_FORMAT',
  SET_EXPORT_WITH_LABELS = 'SET_EXPORT_WITH_LABELS',
  SET_EXPORT_WITH_TABLE = 'SET_EXPORT_WITH_TABLE',
  RESET_EXPORT_STATE = 'RESET_EXPORT_STATE',
}

interface ExportAction {
  type: ACTION_TYPES;
  payload?: boolean | EXPORT_FORMATS | string | null;
}

export const ExportDispatchContext = createContext<Dispatch<ExportAction> | null>(null);

export const exportReducer = (
  state: ExportReducerState,
  action: ExportAction,
): ExportReducerState => {
  switch (action.type) {
    case ACTION_TYPES.SET_IS_EXPORTING:
      return {
        ...state,
        isExporting: action.payload as boolean,
      };
    case ACTION_TYPES.SET_IS_EXPORT_MODE:
      return {
        ...state,
        isExportMode: action.payload as boolean,
      };
    case ACTION_TYPES.SET_EXPORT_ERROR:
      return {
        ...state,
        exportError: action.payload as string | null,
      };
    case ACTION_TYPES.SET_EXPORT_FORMAT:
      return {
        ...state,
        exportFormat: action.payload as EXPORT_FORMATS,
      };
    case ACTION_TYPES.SET_EXPORT_WITH_LABELS:
      return {
        ...state,
        exportWithLabels: action.payload as boolean,
      };
    case ACTION_TYPES.SET_EXPORT_WITH_TABLE:
      return {
        ...state,
        exportWithTable: action.payload as boolean,
      };
    case ACTION_TYPES.RESET_EXPORT_STATE:
      return {
        ...state,
        isExporting: false,
        isExportMode: false,
        exportError: null,
        exportFormat: action.payload === 'matrix' ? EXPORT_FORMATS.XLSX : EXPORT_FORMATS.PNG,
        exportWithLabels: false,
        exportWithTable: true,
        exportWithTableDisabled: false,
      };
    default:
      return state;
  }
};
