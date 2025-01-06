/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import downloadJs from 'downloadjs';
import { API_URL, timeout } from '../api';
import FetchError from '../fetchError';

const EMAIL_TIMEOUT = 1000 * 30; // 30 seconds
type ExportSurveyResponsesResponse = {
  filePath: string;
  blob: Blob;
  contentType: string;
};

export type ExportSurveyResponsesParams = {
  surveyCodes: string;
  entityIds: string;
  countryCode: string;
  startDate?: string;
  endDate?: string;
};

const readBlob = (blob: Blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsText(blob);
  });
};

const getParsedBlob = async data => {
  const blob = (await readBlob(data)) as string;
  return JSON.parse(blob);
};

export const useExportSurveyResponses = () => {
  return useMutation<any, Error, ExportSurveyResponsesParams, unknown>(
    async ({ surveyCodes, entityIds, countryCode, startDate, endDate }) => {
      try {
        // this is a one off case where the response can be either a blob or a json object, so we need to handle this independently from the other endpoints
        const { headers, data } = await axios(`${API_URL}/export/surveyResponses`, {
          responseType: 'blob',
          timeout,
          params: {
            respondWithEmailTimeout: EMAIL_TIMEOUT,
            surveyCodes,
            entityIds,
            countryCode,
            startDate,
            endDate,
            platform: 'datatrak',
          },
        });

        // before returning the data, parse it if it's json, so that we can access the emailTimeoutHit property
        const { 'content-type': contentType, 'content-disposition': contentDisposition } = headers;

        if (contentType?.includes('application/json')) {
          return await getParsedBlob(data);
        }
        // Extract the filename from the content-disposition header
        const regex = /filename="(?<filename>.*)"/; // Find the value between quotes after filename=
        const filePath =
          regex.exec(contentDisposition)?.groups?.filename || `download_${Date.now()}`;

        // otherwise, return the blob and the relevant metadata for download
        return {
          filePath,
          blob: data,
          contentType,
        };
      } catch (e: any) {
        if (e.response) {
          const { data } = e.response;

          // Read the blob - because we have to set responseType: 'blob' in the axios config, the data is a blob even when it's an error object
          const { error: message } = await getParsedBlob(data);

          // Parse content and retrieve 'message'
          throw new FetchError(message, e.response.status, data);
        }
      }
    },
    {
      onSuccess: async (response: ExportSurveyResponsesResponse) => {
        const { filePath, blob, contentType } = response;
        if (!filePath) return;
        downloadJs(blob, filePath, contentType);
      },
    },
  );
};
