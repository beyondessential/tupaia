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
