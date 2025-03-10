import { useUrlParams } from './useUrlParams';

export const useAdminPanelUrl = () => {
  const { locale } = useUrlParams();
  return `/${locale}/admin`;
};
