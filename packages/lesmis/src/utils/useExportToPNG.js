/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useRef, useState } from 'react';
import downloadJs from 'downloadjs';
import domtoimage from 'dom-to-image';
import { sleep, toFilename } from '@tupaia/utils';

const exportToPng = (node, filename) => {
  return new Promise(resolve => {
    const file = `${filename}.png`;
    domtoimage.toPng(node, { bgcolor: 'white' }).then(async dataUrl => {
      downloadJs(dataUrl, file);
      resolve();
    });
  });
};

export const useExportToPNG = filename => {
  const exportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const sanitisedFileName = toFilename(filename);

  const exportToPNG = async () => {
    const node = exportRef.current;

    setIsExporting(true);
    setIsExportLoading(true);

    await exportToPng(node, sanitisedFileName);
    setIsExporting(false);

    // Allow some time for the chart to resize
    await sleep(1000);
    setIsExportLoading(false);
  };

  return { isExporting, isExportLoading, exportRef, exportToPNG };
};
