import { useNavigate, useParams } from 'react-router-dom';

export const useHomeUrl = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { locale } = params;
  const homeUrl = `/${locale}`;

  const isHomeUrl = path => path.replace(/\/$/, '') === homeUrl;

  const navigateToHomeUrl = () => navigate(homeUrl);

  return {
    homeUrl,
    isHomeUrl,
    navigateToHomeUrl,
  };
};
