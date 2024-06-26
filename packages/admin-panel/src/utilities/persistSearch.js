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
      [location.pathname]: search,
    },
  };
};

export const useLinkToPreviousSearchState = url => {
  const location = useLocation();
  const { state } = location;
  const prevSearch = state?.[url];
  return {
    to: {
      ...location,
      pathname: url,
      search: prevSearch ?? '',
    },
    newState: {
      ...state,
      [url]: '',
    },
  };
};
