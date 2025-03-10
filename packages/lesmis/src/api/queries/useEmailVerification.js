import { useQuery } from '@tanstack/react-query';
import { useUrlSearchParams } from '../../utils/useUrlSearchParams';
import { get } from '../api';

export const useEmailVerification = () => {
  const [{ verifyEmailToken }] = useUrlSearchParams();

  return useQuery(['user', verifyEmailToken], () => get(`verify/${verifyEmailToken}`), {
    refetchOnWindowFocus: false,
    retry: 0,
    enabled: !!verifyEmailToken,
  });
};
