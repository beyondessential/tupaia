/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { post } from '../api';
import { useEditUser } from '.';
import { successToast } from '../../utils';

export const useRequestDeleteAccount = (onSuccess: () => void) => {
  // After the user requests to delete their account, we need to update the user's record to make a note that the request has been made
  const { mutate: updateUser } = useEditUser(() => {
    successToast('Your account deletion request has been successfully sent');
    onSuccess();
  });
  return useMutation<any, Error, any, unknown>(() => post('me/deleteAccount'), {
    onSuccess: () => {
      updateUser({
        deleteAccountRequested: true,
      });
    },
  });
};
