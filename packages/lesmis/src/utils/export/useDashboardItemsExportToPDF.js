/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 *
 */
import { useState } from 'react';
import downloadJs from 'downloadjs';
import { stringifyQuery } from '@tupaia/utils';

import { post } from '../../api';

export const useDashboardItemsExportToPDF = options => {
  const { locale, entityCode, ...restOfoptions } = options;
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async fileName => {
    setIsExporting(true);
    const hostname = `${window.location.protocol}//${window.location.host}`;
    const endpoint = `${locale}/pdf-export/${entityCode}`;

    const pdfPageUrl = stringifyQuery(hostname, endpoint, restOfoptions);
    const response = await post('pdf', {
      data: { hostname, pdfPageUrl },
      responseType: 'blob',
    });
    downloadJs(response, `${fileName}.pdf`);
    setIsExporting(false);
  };

  return { isExporting, exportToPDF };
};
