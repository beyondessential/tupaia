/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FileUploadField as BaseFileUploadField } from '@tupaia/ui-components';

export const FileUploadField = ({
  onChange,
  name,
  label,
  helperText,
  textOnButton,
  showFileSize,
  maxSizeInBytes,
}) => {
  const [fileName, setFileName] = useState(null);

  const handleChange = async (event, newFileName, files) => {
    setFileName(newFileName);

    const [file] = files || [];
    if (!file) {
      onChange({
        fileName: null,
        file: null,
      });
      return;
    }

    onChange({
      fileName: newFileName,
      file,
    });
  };

  return (
    <BaseFileUploadField
      onChange={handleChange}
      name={name}
      fileName={fileName}
      label={label}
      helperText={helperText}
      textOnButton={textOnButton}
      showFileSize={showFileSize}
      maxSizeInBytes={maxSizeInBytes}
    />
  );
};

FileUploadField.propTypes = {
  onChange: PropTypes.func,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  helperText: PropTypes.string,
  textOnButton: PropTypes.string,
  showFileSize: PropTypes.bool,
  maxSizeInBytes: PropTypes.number,
};

FileUploadField.defaultProps = {
  onChange: () => {},
  label: null,
  helperText: null,
  textOnButton: null,
  showFileSize: false,
  maxSizeInBytes: null,
};
