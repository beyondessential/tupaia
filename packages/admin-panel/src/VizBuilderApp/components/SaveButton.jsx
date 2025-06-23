import React, { useCallback, useState } from 'react';
import { Button } from '@tupaia/ui-components';
import { useVizConfigErrorContext } from '../context';

import { SaveVisualisationModal } from './Modal';

export const SaveButton = () => {
  const { hasError: vizConfigHasError } = useVizConfigErrorContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  const handleSave = async () => {
    setIsModalOpen(true);
  };
  return (
    <div>
      <Button disabled={vizConfigHasError} onClick={handleSave}>
        Save
      </Button>
      <SaveVisualisationModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};
