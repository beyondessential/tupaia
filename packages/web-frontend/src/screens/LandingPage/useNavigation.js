/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useDispatch } from 'react-redux';
import { setProject, setRequestingAccess } from '../../projects/actions';
import { REQUEST_PROJECT_ACCESS, LANDING } from '../../containers/OverlayDiv/constants';
import { attemptLandingPageLogout, setOverlayComponent } from '../../actions';

export const useNavigation = () => {
  const dispatch = useDispatch();

  const navigateToLogin = () => {
    dispatch(setOverlayComponent(LANDING));
  };

  const navigateToLogout = () => {
    dispatch(attemptLandingPageLogout());
  };

  const navigateToRequestProjectAccess = project => {
    dispatch(setRequestingAccess(project));
    dispatch(setOverlayComponent(REQUEST_PROJECT_ACCESS));
  };

  const navigateToProject = project => {
    dispatch(setProject(project.code));
  };

  return { navigateToLogin, navigateToLogout, navigateToProject, navigateToRequestProjectAccess };
};
