import { useState } from 'react';
import downloadJs from 'downloadjs';
import { stringifyQuery } from '@tupaia/utils';

import { post } from '../../api';

export const useDashboardItemsExportToPDF = options => {
  const { locale, entityCode, ...restOfOptions } = options;
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const exportToPDF = async fileName => {
    setIsExporting(true);
    try {
      const hostname = `${window.location.protocol}//${window.location.host}`;
      const endpoint = `${locale}/pdf-export/${entityCode}`;
      const pdfPageUrl = stringifyQuery(hostname, endpoint, restOfOptions);

      const response = await post('pdf', {
        data: { pdfPageUrl },
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
