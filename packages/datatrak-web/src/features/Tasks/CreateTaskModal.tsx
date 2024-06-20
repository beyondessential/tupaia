/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Modal } from '@tupaia/ui-components';
import { CountrySelector, useUserCountries } from '../CountrySelector';

const CountrySelectorWrapper = styled.div`
  margin-inline-start: auto;
`;

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateTaskModal = ({ open, onClose }: CreateTaskModalProps) => {
  const { countries, isLoading, selectedCountry, updateSelectedCountry } = useUserCountries();
  return (
    <Modal isOpen={open} onClose={onClose} title="New task">
      <CountrySelectorWrapper>
        <CountrySelector
          countries={countries}
          selectedCountry={selectedCountry}
          onChangeCountry={updateSelectedCountry}
        />
      </CountrySelectorWrapper>
    </Modal>
  );
};
