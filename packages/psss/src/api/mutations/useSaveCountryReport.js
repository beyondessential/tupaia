import { FakeAPI } from '../singletons';

export const useSaveCountryReport = params =>
  useMutation(async data => FakeAPI.postdata(data), {
    onSuccess: () => queryCache.invalidateQueries('country-weeks', params),
  });
