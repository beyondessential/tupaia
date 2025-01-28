import { useMutation } from '@tanstack/react-query';
import { post, put } from '../api';

export const useSaveDashboardVisualisation = config =>
  useMutation(
    ['dashboardVisualisation', config],
    () => {
      if (config.id) {
        return put(`dashboardVisualisation/${config.id}`, {
          data: { visualisation: config },
        });
      }
      return post('dashboardVisualisation', {
        data: { visualisation: config },
      });
    },
    {
      throwOnError: true,
    },
  );
