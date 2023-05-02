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

  const exportToPDF = async (fileName, queryParams) => {
    const { selectedDashboardItems } = queryParams;
    if (selectedDashboardItems === '') {
      setErrorMessage('Please select at least one report');
      return;
    }

    setIsExporting(true);
    try {
      const hostname = `${window.location.protocol}/${window.location.host}`;
      const endpoint = `${pathname}/pdf-export`;
      const pdfPageUrl = stringifyQuery(hostname, endpoint, queryParams);

      // Auth cookies are saved against this domain. Pass this to server, so that when it pretends to be us, it can do the same.
      const cookieDomain = new URL(process.env.REACT_APP_CONFIG_SERVER_BASE_URL).hostname;

      await download(
        'pdf',
        () => {},
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pdfPageUrl,
            cookieDomain,
          }),
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
