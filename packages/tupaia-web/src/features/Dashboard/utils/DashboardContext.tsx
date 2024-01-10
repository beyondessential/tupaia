/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { Dispatch, createContext, useReducer } from 'react';

type DashboardReducer = {
  selectedDashboardItems: string[];
  exportModalOpen: boolean;
  subscribeModalOpen: boolean;
};

const defaultState = {
  selectedDashboardItems: [],
  exportModalOpen: false,
  subscribeModalOpen: false,
} as DashboardReducer;

export const DashboardContext = createContext(defaultState);

export enum Actions {
  SET_SELECTED_DASHBOARD_ITEMS = 'SET_SELECTED_DASHBOARD_ITEMS',
  TOGGLE_EXPORT_MODAL = 'TOGGLE_EXPORT_MODAL',
  TOGGLE_SUBSCRIBE_MODAL = 'TOGGLE_SUBSCRIBE_MODAL',
}

interface ActionT {
  type: Actions;
  payload?: string[];
}
export const DashboardDispatchContext = createContext<Dispatch<ActionT> | null>(null);

const dashboardReducer = (state: DashboardReducer, action: ActionT): DashboardReducer => {
  switch (action.type) {
    case Actions.SET_SELECTED_DASHBOARD_ITEMS:
      return {
        ...state,
        selectedDashboardItems: action.payload as string[],
      };
    case Actions.TOGGLE_EXPORT_MODAL:
      return {
        ...state,
        exportModalOpen: !state.exportModalOpen,
      };
    case Actions.TOGGLE_SUBSCRIBE_MODAL:
      return {
        ...state,
        subscribeModalOpen: !state.subscribeModalOpen,
      };
    default:
      return state;
  }
};

// A wrapper containing the context providers for the dashboard
export const DashboardContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, defaultState);
  return (
    <DashboardContext.Provider value={state}>
      <DashboardDispatchContext.Provider value={dispatch}>
        {children}
      </DashboardDispatchContext.Provider>
    </DashboardContext.Provider>
  );
};
