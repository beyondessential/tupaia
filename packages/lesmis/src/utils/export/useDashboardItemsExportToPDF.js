/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 *
 */
import { useState } from 'react';
import downloadJs from 'downloadjs';

import { post } from '../../api';

export const useDashboardItemsExportToPDF = options => {
  const { locale, entityCode, ...restOfoptions } = options;
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const exportToPDF = async fileName => {
    setIsExporting(true);
    try {
      const response = await post('pdf', {
        data: {
          endpoint: `${locale}/pdf-export/${entityCode}`,
          ...restOfoptions,
          hostname: window.location.host,
        },
        responseType: 'blob',
      });
      downloadJs(response, `${fileName}.pdf`);
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
