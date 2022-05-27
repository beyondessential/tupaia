/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useRef, useState } from 'react';
import downloadJs from 'downloadjs';

import { sleep, toFilename } from '@tupaia/utils';
import { getImage } from './getImage';

const exportToImage = (node, filename, formate = 'png') => {
  return new Promise(resolve => {
    const file = `${filename}.${formate}`;
    getImage(node, formate).then(async dataUrl => {
      downloadJs(dataUrl, file);
      resolve();
    });
  });
};

export const useExportToImage = (filename, formate) => {
  const exportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const sanitisedFileName = toFilename(filename, true);
  const node = exportRef.current;

  const exportToImg = async () => {
    setIsExporting(true);
    setIsExportLoading(true);

    await exportToImage(node, sanitisedFileName, formate);
    setIsExporting(false);

    // Allow some time for the chart to resize
    await sleep(1000);
    setIsExportLoading(false);
  };

  return { isExporting, isExportLoading, exportRef, exportToImg };
};
