import { useQuery } from '@tanstack/react-query';
import { TupaiaWebUserRequest } from '@tupaia/types';
import { get } from '../api';

export const useUser = () => {
  const userResponse = useQuery(
    ['getUser'],
    (): Promise<TupaiaWebUserRequest.ResBody> => get('getUser'),
  );
  const { data: user } = userResponse;

  return {
    ...userResponse,
    data: { ...user, name: user?.userName },
    isLoggedIn: !!user?.email,
  };
};
