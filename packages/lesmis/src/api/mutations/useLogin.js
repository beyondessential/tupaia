/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { getBrowserTimeZone } from '@tupaia/utils';
import { post } from '../api';
import { useUser } from '../queries';
import { useHomeUrl } from '../../utils/useHomeUrl';

export const useLogin = () => {
  const { navigateToHomeUrl } = useHomeUrl();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginQuery = useMutation(
    ({ email, password }) =>
      post('login', {
        data: {
          emailAddress: email,
          password,
          deviceName: window.navigator.userAgent,
          timezone: getBrowserTimeZone(),
        },
      }),
    {
      onSuccess: () => {
        queryClient.clear();

        // Send the user back to the previous page if there is one saved in referer
        if (location?.state?.referer) {
          navigate(location.state.referer);
        } else {
          // Otherwise send them to the homepage
          navigateToHomeUrl();
        }
      },
    },
  );

  /**
   * After the login fetch returns successfully, attempt to get the user and
   * overwrite the login query state with the user query. This ensures that the user is
   * not fully logged in until we have fetched a valid user and ensures any errors related to the
   * getting a valid user are displayed at login.
   */
  const userQuery = useUser({ enabled: loginQuery.isSuccess });

  if (loginQuery.isSuccess) {
    return { ...loginQuery, ...userQuery };
  }

  /**
   * If the login was not successful simply return the errors and fetching state related
   * to the login query
   */
  return loginQuery;
};
