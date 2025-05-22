import { request, RequestParameters } from './request';

// Needs to use process.env instead of import.meta.env for compatibility with jest
export const API_URL = process.env.REACT_APP_DATATRAK_WEB_API_URL || 'http://localhost:8110/v1';

export const get = (endpoint: string, options?: RequestParameters) =>
  request(API_URL, endpoint, { method: 'get', ...options });

export const post = (endpoint: string, options?: RequestParameters) =>
  request(API_URL, endpoint, { method: 'post', ...options });

export const put = (endpoint: string, options?: RequestParameters) =>
  request(API_URL, endpoint, { method: 'put', ...options });

export const remove = (endpoint: string) => request(API_URL, endpoint, { method: 'delete' });
