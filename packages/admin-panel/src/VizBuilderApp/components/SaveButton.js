/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@tupaia/ui-components';

import { SaveVisualisationModal } from './Modal';

export const SaveButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  const handleSave = async () => {
    setIsModalOpen(true);
  };
  return (
    <div>
      <Button onClick={handleSave}>Save</Button>
      <SaveVisualisationModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};
