import { useLocation, useNavigate } from 'react-router-dom';
import { MODAL_ROUTES, URL_SEARCH_PARAMS } from '../constants';
import { gaEvent, removeUrlSearchParams } from '.';

const SEARCH_PARAMS_TO_REMOVE = [URL_SEARCH_PARAMS.PROJECT, URL_SEARCH_PARAMS.PASSWORD_RESET_TOKEN];

export const useModal = () => {
  const navigate = useNavigate();
  const { hash, ...location } = useLocation();

  function navigateToModal(
    hashKey: MODAL_ROUTES,
    urlSearchParams?: {
      param: string;
      value: string;
    }[],
  ) {
    const searchParams = new URLSearchParams(location.search);
    if (urlSearchParams) {
      urlSearchParams.forEach(({ param, value }) => {
        searchParams.set(param, value);
      });
    }
    navigate({ ...location, hash: hashKey, search: searchParams.toString() });
  }
  function closeModal() {
    gaEvent('User', 'Close Dialog');
    navigate({
      ...location,
      // remove the modal-associated search params
      search: removeUrlSearchParams(SEARCH_PARAMS_TO_REMOVE),
    });
  }
  function navigateToLogin() {
    navigateToModal(MODAL_ROUTES.LOGIN);
  }
  return { hash: hash.substring(1), closeModal, navigateToModal, navigateToLogin };
};
