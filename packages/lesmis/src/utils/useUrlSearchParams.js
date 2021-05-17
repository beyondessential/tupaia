/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useHistory, useLocation } from 'react-router-dom';

export const useUrlSearchParams = () => {
  const history = useHistory();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const setParams = newParams => {
    Object.entries(newParams).forEach(([key, param]) => {
      if (param === null || param === undefined) {
        params.delete(key);
      } else {
        params.set(key, param.toString());
      }
    });
    history.push({ ...history.location, search: params.toString() });
  };

  return [params, setParams];
};

/**
 * Todo:
 * query string params for dashboard: year, report, dashboard
 * - handle setting true, false in url
 * - handle setting default dashboard
 * - handle opening modal if there is a report set
 */
export const useUrlSearchParam = (param, defaultValue) => {
  const [params, setParams] = useUrlSearchParams();

  const setSelectedParam = newValue => {
    setParams({ [param]: newValue });
  };

  const selectedParam = params.get(param) || defaultValue;

  return [selectedParam, setSelectedParam];
};
