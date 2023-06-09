import React from 'react';
import { Outlet } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { MODAL_TYPES } from '../constants';
import { Projects } from '.';

export const ModalRoute = () => {
  const [searchParams] = useSearchParams();
  const modal = searchParams.get('modal') as (typeof MODAL_TYPES)[keyof typeof MODAL_TYPES];
  if (!modal || !Object.values(MODAL_TYPES).includes(modal)) return <Outlet />;

  const modalViews = {
    [MODAL_TYPES.PROJECTS]: Projects,
  };

  const ModalView = modalViews[modal];
  return (
    <div>
      <ModalView />
      <Outlet />
    </div>
  );
};
