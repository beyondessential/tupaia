/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 *
 */
import { useState } from 'react';
import { stringifyQuery } from '@tupaia/utils';
import { download } from './request';

export const useDashboardItemsExportToPDF = pathname => {
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const exportToPDF = async fileName => {
    setIsExporting(true);
    try {
      const hostname = `${window.location.protocol}/${window.location.host}`;
      const endpoint = `${pathname}/pdf-export`;
      const pdfPageUrl = stringifyQuery(hostname, endpoint);

      await download(
        'pdf',
        () => {},
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pdfPageUrl }),
          responseType: 'blob',
        },
        fileName,
      );
    } catch (e) {
      setErrorMessage('Network Error. Please try again');
    }

    setIsExporting(false);
  };

  const onReset = () => {
    setErrorMessage(null);
    setIsExporting(false);
  };

  return { isExporting, exportToPDF, errorMessage, onReset };
};
