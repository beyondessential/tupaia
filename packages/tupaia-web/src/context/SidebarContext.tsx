/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { Dispatch, ReactNode, ReducerAction, createContext, useReducer } from 'react';

// The default state of the sidebar context
const defaultState = {
  isExpanded: false,
  expandedWidth: 300,
  contractedWidth: 300,
};

// This is the sidebar state context
export const SidebarContext = createContext(defaultState);

export const SIDEBAR_ACTION_TYPES = {
  TOGGLE: 'toggle',
  RESIZE: 'resize',
};

// TODO: Add types here
// This is the reducer for the sidebar state context
export const sidebarReducer = (state: any, action: any) => {
  switch (action.type) {
    case SIDEBAR_ACTION_TYPES.TOGGLE:
      return { ...state, isExpanded: action.payload.isExpanded };
    case SIDEBAR_ACTION_TYPES.RESIZE: {
      const { expandedWidth, contractedWidth } = action.payload;
      return { ...state, expandedWidth, contractedWidth };
    }
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

// This is the sidebar dispatch context, that handles updating the sidebar state
export const SidebarDispatchContext = createContext<Dispatch<ReducerAction<typeof sidebarReducer>>>(
  () => {},
);

// This is the provider for the sidebar contexts. It exposes the state and dispatch contexts to anything within it (needed for Map and Sidebar components)
export const SidebarProviders = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(sidebarReducer, defaultState);
  return (
    <SidebarContext.Provider value={state}>
      <SidebarDispatchContext.Provider value={dispatch}>{children}</SidebarDispatchContext.Provider>
    </SidebarContext.Provider>
  );
};
