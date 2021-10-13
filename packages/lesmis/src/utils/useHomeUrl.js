/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useRouteMatch } from 'react-router-dom';

export const useHomeUrl = () => {
  const { params } = useRouteMatch();
  const { locale } = params;
  const homeUrl = `/${locale}`;

  const isHomeUrl = path => path.replace(/\/$/, '') === homeUrl;

  return {
    homeUrl,
    isHomeUrl,
  };
};
