/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const ExportOptionsContext = createContext(null);

export const ExportOptionsProvider = ({ children }) => {
  const [exportWithLabels, setExportWithLabels] = useState(false);
  const [exportWithTable, setExportWithTable] = useState(false);

  const toggleExportWithLabels = () => {
    setExportWithLabels(!exportWithLabels);
  };
  const toggleExportWithTable = () => {
    setExportWithTable(!exportWithTable);
  };
  return (
    <ExportOptionsContext.Provider
      value={{
        exportWithLabels,
        toggleExportWithLabels,
        exportWithTable,
        toggleExportWithTable,
      }}
    >
      {children}
    </ExportOptionsContext.Provider>
  );
};

export const useExportOptions = () => useContext(ExportOptionsContext);

ExportOptionsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
