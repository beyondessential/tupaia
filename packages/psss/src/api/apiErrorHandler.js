/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import axios from 'axios';
import { logout } from '../store';

// if the server responds with 401, then logout user
export const apiErrorHandler = store => {
  axios.interceptors.response.use(
    next => {
      return Promise.resolve(next);
    },
    async error => {
      if (error.response.status === 401) {
        await store.dispatch(logout(error.response.data.error));
        return Promise.resolve(error);
      }
      return Promise.reject(error);
    },
  );
};
