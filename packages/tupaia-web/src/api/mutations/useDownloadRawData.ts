/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useMutation } from 'react-query';
import downloadJs from 'downloadjs';
import { get } from '..';

export const useDownloadRawData = downloadUrl => {
  return useMutation<any, Error, string[], unknown>(
    async (surveyCodes: string[]) => {
      const response = await get(downloadUrl, {
        responseType: 'blob',
        returnHeaders: true,
        params: {
          surveyCodes: surveyCodes.join(','),
        },
      });
      // before returning the data, parse it if it's json, so that we can access the emailTimeoutHit property
      const { headers, data } = response;
      const { 'content-type': contentType, 'content-disposition': contentDisposition } = headers;
      if (contentType?.includes('application/json')) {
        return JSON.parse(await data.text());
      }
      // Extract the filename from the content-disposition header
      const regex = /filename="(?<filename>.*)"/; // Find the value between quotes after filename=
      const filePath = regex.exec(contentDisposition)?.groups?.filename || `download_${Date.now()}`;

      // otherwise, return the blob and the relevant metadata for download
      return {
        filePath,
        blob: data,
        contentType,
      };
    },
    {
      onSuccess: async (response: any) => {
        const { filePath, blob, contentType } = response;
        if (!filePath) return;
        downloadJs(blob, filePath, contentType);
      },
    },
  );
};
