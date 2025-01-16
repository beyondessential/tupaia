import { useQuery } from '@tanstack/react-query';
import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const useMapOverlayVisualisation = (visualisationId, enabled) =>
  useQuery(
    ['mapOverlayVisualisation', visualisationId],
    async () => get(`mapOverlayVisualisation/${visualisationId}`),
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
      enabled,
    },
  );
