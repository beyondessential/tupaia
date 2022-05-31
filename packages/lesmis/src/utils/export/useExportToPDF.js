/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import { useState } from 'react';
import { exportImagesToPDF } from './exportImagesToPDF';
import { useCustomGetImages } from './getImages';

export const useExportToPDF = fileName => {
  const { addToRefs, getImgs } = useCustomGetImages();
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    const pageScreenshots = await getImgs();
    await exportImagesToPDF(pageScreenshots, fileName);
    setIsExporting(false);
  };
  return { addToRefs, isExporting, exportToPDF };
};
