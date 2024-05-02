/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useNavigate, useLocation } from 'react-router-dom';

export const useUrlSearchParams = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);

  const setParams = (newParams, pushToHistory = true) => {
    Object.entries(newParams).forEach(([key, param]) => {
      if (param === null || param === undefined) {
        urlParams.delete(key);
      } else {
        urlParams.set(key, param.toString());
      }
    });

    if (location.search !== urlParams.toString()) {
      if (pushToHistory) {
        navigate({ ...location, search: urlParams.toString() });
      } else {
        navigate(
          { ...location, search: urlParams.toString() },
          {
            replace: true,
          },
        );
      }
    }
  };

  const params = {};

  urlParams.forEach((value, key) => {
    params[key] = value;
  });

  return [params, setParams];
};

export const useUrlSearchParam = (param, defaultValue = null) => {
  const [params, setParams] = useUrlSearchParams();

  const setSelectedParam = newValue => {
    setParams({ [param]: newValue });
  };

  const selectedParam = params[param] || defaultValue;

  return [selectedParam, setSelectedParam];
};
