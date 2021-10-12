/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useRouteMatch } from 'react-router-dom';

export const useUrlParams = () => {
  const { params } = useRouteMatch();
  const { lang, entityCode, view } = params;
  return {
    lang,
    entityCode,
    view,
  };
};
