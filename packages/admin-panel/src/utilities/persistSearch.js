import { useLocation } from 'react-router';

export const useLinkWithSearchState = url => {
  const location = useLocation();
  if (!url) return { to: null, newState: null };
  const { state, search } = location;

  return {
    to: {
      ...location,
      pathname: url,
      search: '',
    },
    newState: {
      ...state,
      prevSearch: search,
    },
  };
};

export const useLinkToPreviousSearchState = url => {
  const location = useLocation();
  const { state } = location;
  const { prevSearch } = state || {};

  return {
    to: {
      ...location,
      pathname: url,
      search: prevSearch ?? '',
    },
    newState: {
      ...state,
      prevSearch: '',
    },
  };
};
