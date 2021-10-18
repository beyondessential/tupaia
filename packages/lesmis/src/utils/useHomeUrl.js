/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useHistory, useRouteMatch } from 'react-router-dom';

export const useHomeUrl = () => {
  const { params } = useRouteMatch();
  const { push } = useHistory();
  const { locale } = params;
  const homeUrl = `/${locale}`;

  const isHomeUrl = path => path.replace(/\/$/, '') === homeUrl;

  const pushToHomeUrl = push(homeUrl);

  return {
    homeUrl,
    isHomeUrl,
    pushToHomeUrl,
  };
};
