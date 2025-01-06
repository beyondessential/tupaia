/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from '@tanstack/react-query';
import downloadJs from 'downloadjs';
import { getUniqueFileNameParts } from '@tupaia/utils';
import { get } from '../api';

const getMultiFileDownloadFileName = () => {
  return `tupaia-download-${new Date().toLocaleString('default', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })}.zip`;
};

export const useDownloadFiles = () => {
  return useMutation(
    ['download'],
    async (uniqueFileNames: string[]) =>
      get('downloadFiles', {
        responseType: 'blob',
        params: {
          uniqueFileNames:
            uniqueFileNames.length === 1 ? uniqueFileNames[0] : uniqueFileNames.join(','),
        },
      }),
    {
      onSuccess: async (data: any, uniqueFileNames: string[]) => {
        const fileName =
          uniqueFileNames.length === 1
            ? getUniqueFileNameParts(uniqueFileNames[0]).fileName
            : getMultiFileDownloadFileName();

        downloadJs(data, fileName);
      },
    },
  );
};
