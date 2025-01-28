import { saveAs } from 'file-saver';
import { parse } from 'content-disposition-header';
import { logout } from '../authentication';

import { verifyResponseStatus, stringifyQuery } from '@tupaia/utils';

const FETCH_TIMEOUT = 120 * 1000; // 120 seconds in milliseconds

const isJsonResponse = response => {
  const contentType = response.headers.get('content-type');
  return contentType.startsWith('application/json');
};

const { REACT_APP_API_URL = 'http://localhost:8070/v1', REACT_APP_CLIENT_BASIC_AUTH_HEADER } =
  import.meta.env;

export class TupaiaApi {
  constructor(config) {
    this.store = null; // Redux store for keeping state, will be injected after creation
    // set config
    this.apiUrl = config?.apiUrl || REACT_APP_API_URL;
    this.clientBasicAuthHeader = config?.basicAuthHeader || REACT_APP_CLIENT_BASIC_AUTH_HEADER;
  }

  injectReduxStore(store) {
    this.store = store;
  }

  dispatch(action) {
    this.store.dispatch(action);
  }

  get(endpoint, queryParameters) {
    return this.requestJson(endpoint, queryParameters, this.buildFetchConfig('GET'));
  }

  post(endpoint, queryParameters, body, authHeader, ...otherParams) {
    const fetchConfig = this.buildFetchConfig('POST', authHeader, body);
    return this.requestJson(endpoint, queryParameters, fetchConfig, ...otherParams);
  }

  put(endpoint, queryParameters, body, authHeader, ...otherParams) {
    const fetchConfig = this.buildFetchConfig('PUT', authHeader, body);
    return this.requestJson(endpoint, queryParameters, fetchConfig, ...otherParams);
  }

  delete(endpoint) {
    const fetchConfig = this.buildFetchConfig('DELETE');
    return this.requestJson(endpoint, null, fetchConfig);
  }

  multipartPost({ endpoint, filesByMultipartKey, queryParameters, payload }) {
    return this.multipart({
      method: 'POST',
      endpoint,
      filesByMultipartKey,
      queryParameters,
      payload,
    });
  }

  multipartPut({ endpoint, filesByMultipartKey, queryParameters, payload }) {
    return this.multipart({
      method: 'PUT',
      endpoint,
      filesByMultipartKey,
      queryParameters,
      payload,
    });
  }

  /**
   * @param {string} method
   * @param {string} endpoint
   * @param {File[]} filesByMultipartKey
   * @param {} [queryParameters]
   * @param {{}} [payload] The multipartJson part which is not a file. Sent as JSON.
   * @return {Promise<{headers: *, body: *}>}
   */
  multipart({ method, endpoint, filesByMultipartKey, queryParameters, payload }) {
    const formData = new FormData();
    Object.entries(filesByMultipartKey).forEach(([key, file]) => formData.append(key, file));
    if (payload) {
      formData.append('payload', JSON.stringify(payload));
    }
    const fetchConfig = this.buildFetchConfig(method, null, formData, false);
    return this.requestJson(endpoint, queryParameters, fetchConfig);
  }

  /**
   * @param endpoint
   * @param queryParameters
   * @param {string?} fileName if provided, overrides the fileName returned from the server
   * @return {Promise<{}|{headers, body: ({emailTimeoutHit}|*)}>}
   */
  async download(endpoint, queryParameters, fileName = null) {
    const response = await this.request(endpoint, queryParameters, this.buildFetchConfig('GET'));

    // Check if this is an early response indicating it will be emailed
    if (isJsonResponse(response)) {
      const body = await response.clone().json();
      if (body.emailTimeoutHit) {
        return { headers: response.headers, body };
      }
    }

    let resolvedFileName = fileName;
    if (!fileName) {
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const parsedContentDisposition = parse(contentDisposition);
        resolvedFileName = parsedContentDisposition.parameters.filename;
      } else {
        resolvedFileName = 'Download';
      }
    }

    const responseBlob = await response.blob();
    saveAs(responseBlob, resolvedFileName);
    return {};
  }

  upload(endpoint, fileName, files, queryParameters) {
    const body = new FormData();
    files.forEach(file => body.append(fileName, file));
    const fetchConfig = this.buildFetchConfig('POST', null, body, false);
    return this.requestJson(endpoint, queryParameters, fetchConfig);
  }

  async requestJson(...params) {
    const response = await this.request(...params);
    const body = await response.json();
    return { headers: response.headers, body };
  }

  async request(endpoint, queryParameters, fetchConfig) {
    const queryUrl = stringifyQuery(this.apiUrl, endpoint, queryParameters);
    const response = await Promise.race([fetch(queryUrl, fetchConfig), createTimeoutPromise()]);

    await verifyResponseStatus(response);
    return response;
  }

  buildFetchConfig(requestMethod, authHeader, body, isJson = true) {
    const fetchConfig = {
      method: requestMethod || 'GET',
      headers: {
        Authorization: authHeader,
      },
      credentials: 'include', // need to be set for cookies to save
    };
    if (isJson) {
      fetchConfig.headers['Content-Type'] = 'application/json';
    }
    if (body) {
      fetchConfig.body =
        typeof body === 'object' && !(body instanceof FormData) ? JSON.stringify(body) : body;
    }
    return fetchConfig;
  }
}

// Create a promise that rejects after the request has taken too long
const createTimeoutPromise = () =>
  new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error('Network request timed out'));
    }, FETCH_TIMEOUT);
  });
