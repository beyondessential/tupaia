import { request, RequestParameters } from './request';

// Needs to use process.env instead of import.meta.env for compatibility with jest
export const SYNC_API_URL =
  process.env.REACT_APP_DATATRAK_WEB_SYNC_API_URL || 'http://localhost:8110/v1';

export const stream = async (endpoint: string, options?: RequestParameters) => {
  try {
    const response = await fetch(`${SYNC_API_URL}/${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    return response.body!.getReader();
  } catch (error: any) {
    throw new Error(error);
  }
};

export const syncGet = (endpoint: string, options?: RequestParameters) =>
  request(SYNC_API_URL, endpoint, { method: 'get', ...options });

export const syncPost = (endpoint: string, options?: RequestParameters) =>
  request(SYNC_API_URL, endpoint, { method: 'post', ...options });

export const syncPut = (endpoint: string, options?: RequestParameters) =>
  request(SYNC_API_URL, endpoint, { method: 'put', ...options });

export const syncRemove = (endpoint: string) =>
  request(SYNC_API_URL, endpoint, { method: 'delete' });
