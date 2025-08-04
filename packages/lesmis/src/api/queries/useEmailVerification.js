import { useQuery } from '@tanstack/react-query';
import { useUrlSearchParams } from '../../utils/useUrlSearchParams';
import { get } from '../api';

export const useEmailVerification = () => {
  const [{ verifyEmailToken }] = useUrlSearchParams();
  console.log('verifyEmailToken', verifyEmailToken);

  return useQuery(
    ['user', verifyEmailToken],
    () => get(`verify/${encodeURIComponent(verifyEmailToken)}`),
    {
      refetchOnWindowFocus: false,
      retry: 0,
      enabled: !!verifyEmailToken,
    },
  );
};
