/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Modal } from '@tupaia/ui-components';
import React from 'react';

export const AssignTaskModal = ({ surveyCode, countryCode }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Assign task">
        <div>Assign Task Modal</div>
      </Modal>
    </>
  );
};
