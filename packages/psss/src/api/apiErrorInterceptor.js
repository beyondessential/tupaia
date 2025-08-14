import axios from 'axios';
import { logout } from '../store';

// if the server responds with 401, then logout user
export const apiErrorInterceptor = store => {
  axios.interceptors.response.use(
    next => {
      return Promise.resolve(next);
    },
    async error => {
      if (error.response.status === 401) {
        await store.dispatch(logout(error.response.data.error));
        return Promise.reject(error);
      }
      return Promise.reject(error);
    },
  );
};
