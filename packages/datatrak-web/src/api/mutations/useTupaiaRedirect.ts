/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { useCurrentUser } from '../CurrentUserContext';
import { post } from '../api';

const TUPAIA_REDIRECT_URL = process.env.REACT_APP_TUPAIA_REDIRECT_URL || 'https://tupaia.org'

export const useTupaiaRedirect = () => {
  const user = useCurrentUser();

  return useMutation<any, Error, Record<never, any>, unknown>(
    () => {
      return post('generateLoginToken');
    },
    {
      onSuccess: ({ token }) => {
        window.open(`${TUPAIA_REDIRECT_URL}/${user.project?.code}/${user.project?.homeEntityCode}?loginToken=${token}`, '_blank');
      },
    }
  );
};
