import { useNavigate } from 'react-router-dom';
import { useHomeUrl } from '../../utils/useHomeUrl';

export const useValidatedQuery = query => {
  const navigate = useNavigate();
  const { homeUrl } = useHomeUrl();

  if (query.isError && query.error.code === 403) {
    navigate(`${homeUrl}/page-not-found`);
  }
  return query;
};
