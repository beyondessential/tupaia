import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { URL_SEARCH_PARAMS } from '../constants';
import { useOneTimeLogin } from '../api/mutations';

export function useUrlLoginToken() {
  const [urlSearchParams] = useSearchParams();
  const { mutate: attemptLogin } = useOneTimeLogin();
  const token = urlSearchParams.get(URL_SEARCH_PARAMS.ONE_TIME_LOGIN_TOKEN);
  useEffect(() => {
    if (token) {
      attemptLogin({ token });
    }
  }, [token]);
}
