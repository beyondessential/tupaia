/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useMutation } from 'react-query';
import downloadJs from 'downloadjs';
import { getUniqueFileNameParts } from '@tupaia/utils';
import { get } from '../api';

export const useDownloadFiles = () => {
  return useMutation(
    ['download'],
    async (uniqueFileNames: string[]) => {
      let fileName, fileNamesParam;

      if (uniqueFileNames.length === 1) {
        fileName = getUniqueFileNameParts(uniqueFileNames[0]).fileName;
        fileNamesParam = uniqueFileNames[0];
      } else {
        fileNamesParam = uniqueFileNames.join(',');
        fileName = `tupaia-download-${new Date().toLocaleString('default', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })}.zip`;
      }

      await get(`downloadFiles?uniqueFileNames=${fileNamesParam}`);
      return fileName;
    },
    {
      onSuccess: async (response: any, _variables, fileName?: string) => {
        console.log('fileName', fileName);
        const responseBlob = await response?.blob();
        downloadJs(responseBlob, fileName);

        return true;
      },
    },
  );
};
