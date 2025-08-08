import { createContext } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { DashboardItemConfig, DashboardItemReport } from '@tupaia/types';
import { DashboardItem } from '../../types';

type DashboardItemState = {
  config?: DashboardItemConfig | null;
  report?: DashboardItemReport | null;
  isLoading: boolean;
  error?: UseQueryResult['error'] | null;
  refetch?: UseQueryResult['refetch'];
  isEnlarged?: boolean;
  isExport?: boolean;
  reportCode?: DashboardItem['reportCode'];
  isEnabled?: boolean;
};
const defaultContext = {
  config: null,
  report: null,
  isLoading: false,
  error: null,
  refetch: () => {},
  isEnabled: true,
} as DashboardItemState;

export const DashboardItemContext = createContext(defaultContext);
