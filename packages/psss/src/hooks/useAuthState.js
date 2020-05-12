/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { FakeStore } from '../FakeStore';

export const useAuthState = () => {
  const state = FakeStore.auth;
  const isPending = state.status === 'pending';
  const isSuccess = state.status === 'success';
  const isError = state.status === 'error';
  const isAuthenticated = state.user && isSuccess;
  return {
    ...state,
    isPending,
    isSuccess,
    isError,
    isAuthenticated,
  };
};
