import React, { useState } from 'react';

import { ExportModal } from './ExportModal';
import { ReduxAutocomplete } from '../autocomplete';

export const EntityHierarchyExportModal = () => {
  const [hierarchies, setHierarchies] = useState(null);

  return (
    <ExportModal
      title="Download entity hierarchies"
      values={{ hierarchies }}
      exportEndpoint="hierarchies"
    >
      <ReduxAutocomplete
        label="Hierarchy to download"
        helperText="Please select an entity hierarchy to download"
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
