/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useMatch } from 'react-router-dom';

export const useUrlParams = () => {
  const { params } = useMatch();
  const { locale, entityCode, view } = params;

  return {
    locale,
    entityCode,
    view,
  };
};
