/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';

import { ExportModal } from './ExportModal';
import { ReduxAutocomplete } from '../autocomplete';

export const EntityHierarchyExportModal = () => {
  const [hierarchies, setHierarchies] = useState(null);

  return (
    <ExportModal
      title="Export Entity Hierarchies"
      values={{ hierarchies }}
      exportEndpoint="hierarchies"
    >
      <ReduxAutocomplete
        label="Hierarchy to export"
        helperText="Please select an entity hierarchy to export"
        reduxId="hierarchyIds"
        onChange={setHierarchies}
        endpoint="hierarchies"
        optionLabelKey="name"
        optionValueKey="code"
        allowMultipleValues
      />
    </ExportModal>
  );
};
