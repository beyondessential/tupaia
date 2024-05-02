/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useNavigate, useMatch } from 'react-router-dom';

export const useHomeUrl = () => {
  const { params } = useMatch();
  const navigate = useNavigate();
  const { locale } = params;
  const homeUrl = `/${locale}`;

  const isHomeUrl = path => path.replace(/\/$/, '') === homeUrl;

  const navigateToHomeUrl = () => navigate(homeUrl);

  return {
    homeUrl,
    isHomeUrl,
    navigateToHomeUrl,
  };
};
