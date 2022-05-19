/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useRef, useState } from 'react';
import downloadJs from 'downloadjs';
import domtoimage from 'dom-to-image';
import { sleep, toFilename } from '@tupaia/utils';

const getFormatter = formate => {
  switch (formate) {
    case 'svg':
      return domtoimage.toSvg;
    case 'png':
    default:
      return domtoimage.toPng;
  }
};

const exportToImage = (node, filename, formate = 'png') => {
  const formatter = getFormatter(formate);
  return new Promise(resolve => {
    const file = `${filename}.${formate}`;
    formatter(node, { bgcolor: 'white' }).then(async dataUrl => {
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

  const exportToImg = async () => {
    const node = exportRef.current;

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
