/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useHistory, useLocation } from 'react-router-dom';

export const useURLSearchParams = () => {
  const history = useHistory();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const setParams = newParams => {
    Object.entries(newParams).forEach(([key, param]) => {
      if (!param) {
        params.delete(key);
      } else {
        params.set(key, param.toString());
      }
    });
    history.push({ ...history.location, search: params.toString() });
  };

  return [params, setParams];
};
