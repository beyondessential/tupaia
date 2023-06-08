/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { DEFAULT_URL } from '../constants';
import { useLocation, useNavigate } from 'react-router-dom';

export const useNavigateBack = () => {
  const navigate = useNavigate();
  const { key } = useLocation();

  return function navigateBack() {
    /* The location.key property is a unique string associated with this location. On the initial location, this will be the string default. On all subsequent locations, this string will be a unique identifier.
    { @link https://github.com/remix-run/history/blob/main/docs/api-reference.md#locationkey } */
    if (key === 'default') {
      navigate(DEFAULT_URL);
    } else {
      navigate(-1);
    }
  };
};
