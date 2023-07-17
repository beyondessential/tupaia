/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useMutation } from 'react-query';
import downloadJs from 'downloadjs';
import { get } from '../api';

const getFilenameFromPath = (fileName: string) => fileName.split('/').at(-1);
const getZipFileName = () =>
  `tupaia-download-${new Date().toLocaleString('default', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })}.zip`;

export const useDownload = () => {
  return useMutation(
    ['download'],
    async (files: string[]) => {
      const filesString = files.join(',');
      await get(`downloadFiles?files=${filesString}`);
      return files.length === 1 ? getFilenameFromPath(files[0]) : getZipFileName();
    },
    {
      onSuccess: async (response: any, _variables, fileName?: string) => {
        const responseBlob = await response?.blob();
        downloadJs(responseBlob, fileName);

        return true;
      },
    },
  );
};
