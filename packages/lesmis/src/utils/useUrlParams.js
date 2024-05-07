/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useParams, useLocation } from 'react-router-dom';

export const useUrlParams = () => {
  const params = useParams();
  const location = useLocation();
  const view = location.pathname.split('/').pop();
  const { locale, entityCode } = params;

  return {
    locale,
    entityCode,
    view,
  };
};
