import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { MODAL_TYPES } from '../constants';
import { Projects } from '.';
import { Modal } from '../components';

export const ModalRoute = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const modal = searchParams.get('modal') as typeof MODAL_TYPES[keyof typeof MODAL_TYPES];
  if (!modal || !Object.values(MODAL_TYPES).includes(modal)) return null;

  const modalViews = {
    [MODAL_TYPES.PROJECTS]: Projects,
  };

  const onCloseModal = () => {
    // remove the modal param from URLSearchParams
    searchParams.delete('modal');
    setSearchParams(searchParams);
  };

  const ModalView = modalViews[modal];
  return (
    <Modal isOpen={true} onClose={onCloseModal}>
      <ModalView />
    </Modal>
  );
};
