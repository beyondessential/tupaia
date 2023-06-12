/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { MODAL_TYPES } from '../constants';
import { Projects } from '.';
import { Modal } from '../components';

/**
 * This is the wrapper to handle any search param routes that should be modals
 */
export const ModalRoute = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const modal = searchParams.get('modal') as typeof MODAL_TYPES[keyof typeof MODAL_TYPES];
  // If no modal param or invalid modal param, return null
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
