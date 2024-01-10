/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { Dispatch, createContext, useContext, useReducer } from 'react';
import { useParams } from 'react-router';
import { useDashboards } from '../../api/queries';
import { useGAEffect } from '../../utils';

type DashboardReducer = {
  selectedDashboardItems: string[];
  exportModalOpen: boolean;
  subscribeModalOpen?: boolean;
};

const defaultState = {
  selectedDashboardItems: [],
  exportModalOpen: false,
  subscribeModalOpen: false,
} as DashboardReducer;

const DashboardContext = createContext(defaultState);

enum Actions {
  SET_SELECTED_DASHBOARD_ITEMS = 'SET_SELECTED_DASHBOARD_ITEMS',
  TOGGLE_EXPORT_MODAL = 'TOGGLE_EXPORT_MODAL',
  TOGGLE_SUBSCRIBE_MODAL = 'TOGGLE_SUBSCRIBE_MODAL',
}

interface ActionT {
  type: Actions;
  payload?: string[];
}
const DashboardDispatchContext = createContext<Dispatch<ActionT> | null>(null);

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

export const useDashboard = () => {
  const { projectCode, entityCode, dashboardName } = useParams();
  const { data: dashboards, ...dashboardResult } = useDashboards(projectCode, entityCode);
  const { selectedDashboardItems, exportModalOpen, subscribeModalOpen } =
    useContext(DashboardContext);
  const dispatch = useContext(DashboardDispatchContext);

  const setSelectedDashboardItems = (items: string[]) => {
    dispatch?.({ type: Actions.SET_SELECTED_DASHBOARD_ITEMS, payload: items });
  };

  const toggleExportModal = () => {
    dispatch?.({ type: Actions.TOGGLE_EXPORT_MODAL });
  };

  const toggleSubscribeModal = () => {
    dispatch?.({ type: Actions.TOGGLE_SUBSCRIBE_MODAL });
  };

  let activeDashboard;

  if (dashboards?.length > 0 && dashboardName) {
    // trim dashboard name to avoid issues with trailing or leading spaces
    activeDashboard = dashboards?.find(dashboard => dashboard.name.trim() === dashboardName.trim());
  }

  useGAEffect('Dashboard', 'Change Tab', activeDashboard?.name);

  return {
    ...dashboardResult,
    dashboards,
    activeDashboard,
    selectedDashboardItems,
    setSelectedDashboardItems,
    toggleExportModal,
    exportModalOpen,
    subscribeModalOpen,
    toggleSubscribeModal,
  };
};

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
