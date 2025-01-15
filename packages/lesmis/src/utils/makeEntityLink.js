import { generatePath } from 'react-router-dom';

export const makeEntityLink = (entityCode, view = 'dashboard') => {
  const locale = window.location.pathname.split('/')[1];
  return generatePath(`/:locale/:entityCode/:view`, {
    locale,
    entityCode,
    view,
  });
};
