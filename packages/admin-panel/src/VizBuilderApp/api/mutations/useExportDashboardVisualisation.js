/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from '@tanstack/react-query';
import { download } from '../api';

export const useExportDashboardVisualisation = config =>
  useMutation(['export/dashboardVisualisation', config], () =>
    download(
      'export/dashboardVisualisation',
      {
        data: { visualisation: config },
      },
      `${config.code || 'New Dashboard Visualisation'}.json`,
    ),
  );
