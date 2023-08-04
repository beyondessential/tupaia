/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { useUrlParams } from './useUrlParams';

export const useAdminPanelUrl = () => {
  const { locale } = useUrlParams();
  return `/${locale}/admin`;
};
