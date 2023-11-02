/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { post } from '../api';
import { gaEvent } from '../../utils';
import { DEFAULT_URL, MODAL_ROUTES } from '../../constants';
import { useLandingPage } from '../queries';

export const useLogout = () => {
  const { landingPageUrlSegment } = useParams();
  const { isLandingPage } = useLandingPage(landingPageUrlSegment);
  const location = useLocation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation('logout', () => post('logout'), {
    onMutate: () => {
      gaEvent('User', 'Log out');
    },
    onSuccess: () => {
      if (isLandingPage) {
        navigate({
          ...location,
          hash: MODAL_ROUTES.LOGIN,
        });
      } else {
        navigate(`${DEFAULT_URL}#${MODAL_ROUTES.LOGIN}`);
      }
      queryClient.invalidateQueries();
    },
  });
};
