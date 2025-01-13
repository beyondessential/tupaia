import { useQuery } from '@tanstack/react-query';
import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const useMapOverlays = () =>
  useQuery(['mapOverlays'], () => get('mapOverlays'), {
    ...DEFAULT_REACT_QUERY_OPTIONS,
  });
