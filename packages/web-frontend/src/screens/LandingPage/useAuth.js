/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useDispatch, useSelector } from 'react-redux';
import { attemptUserLogout, setOverlayComponent } from '../../actions';
import { LANDING } from '../../containers/OverlayDiv/constants';

export const useAuth = () => {
  const dispatch = useDispatch();

  const authentication = useSelector(state => state.authentication);
  const navigateToLogin = () => {
    dispatch(setOverlayComponent(LANDING));
  };

  const navigateToLogout = () => {
    dispatch(attemptUserLogout());
  };

  return { ...authentication, navigateToLogin, navigateToLogout };
};
