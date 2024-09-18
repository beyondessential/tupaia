/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import download from 'downloadjs';
import JSZip from 'jszip';
import { useMutation } from '@tanstack/react-query';
import { ViewReport } from '@tupaia/types';

export const useDownloadImages = (
  projectCode,
  entityCode,
  dashboardCode,
  reportCode,
  images: ViewReport['data'],
) => {
  return useMutation(
    ['images', projectCode, entityCode, dashboardCode, reportCode],
    async () => {
      return Promise.all(
        images?.map(photo =>
          fetch(photo.value, {
            method: 'GET',
          }).then(async response => {
            return {
              blob: await response.blob(),
              label: photo.label,
            };
          }),
        ) ?? [],
      );
    },
    {
      onSuccess: async fetchedImages => {
        if (fetchedImages.length === 1) {
          const { blob } = fetchedImages[0];
          const { type } = blob;
          const fileExtension = type.split('/')[1];
          download(
            blob,
            `${projectCode}_${entityCode}_${dashboardCode}_${reportCode}.${fileExtension}`,
          );
          return;
        }

        const blobsWithNames: {
          blob: Blob;
          name: string;
        }[] = [];

        const replaceRegex = new RegExp(/\s\(\d+\)$/);

        fetchedImages.forEach((image, index) => {
          const { label, blob } = image;

          if (label) {
            // If there is a label and it is already in the list, add a count to the label
            const count = blobsWithNames.filter(
              b => b.name.replace(replaceRegex, '') === label,
            ).length;
            if (count > 0) {
              return blobsWithNames.push({ blob, name: `${label} (${count + 1})` });
            }
            // If there is a label and it is not in the list, add it
            return blobsWithNames.push({ blob, name: label });
          }
          // Default to Image 1, Image 2, etc.
          blobsWithNames.push({ blob, name: `${reportCode}_image_${index + 1}` });
        });

        const zip = new JSZip();

        blobsWithNames.forEach(({ blob, name }) => {
          const { type } = blob;
          const fileExtension = type.split('/')[1];
          const fileName = `${name}.${fileExtension}`;
          zip.file(fileName, blob);
        });

        zip.generateAsync({ type: 'blob' }).then(blob => {
          download(blob, `${projectCode}_${entityCode}_${dashboardCode}_${reportCode}.zip`);
        });
      },
    },
  );
};
