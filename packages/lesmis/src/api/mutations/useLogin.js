/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import { post } from '../api';
import { useUser } from '../queries';
import { useHomeUrl } from '../../utils/useHomeUrl';

export const useLogin = () => {
  const { pushToHomeUrl } = useHomeUrl();
  const { push, location } = useHistory();
  const queryClient = useQueryClient();

  const loginQuery = useMutation(
    ({ email, password }) =>
      post('login', {
        data: {
          emailAddress: email,
          password,
          // eslint-disable-next-line no-undef
          deviceName: window.navigator.userAgent,
        },
      }),
    {
      onSuccess: () => {
        queryClient.clear();

        // Send the user back to the previous page if there is one saved in referer
        if (location?.state?.referer) {
          push(location.state.referer);
        } else {
          // Otherwise send them to the homepage
          pushToHomeUrl();
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
