/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
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
  initialFileName = null,
  accept = '*',
  ariaLabelledBy,
  ariaDescribedBy,
  buttonVariant,
}) => {
  const [fileName, setFileName] = useState(initialFileName);

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

  // Allows programmatic setting of the file name
  useEffect(() => {
    setFileName(initialFileName);
  }, [initialFileName]);

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
      accept={accept}
      ariaLabelledBy={ariaLabelledBy}
      ariaDescribedBy={ariaDescribedBy}
      buttonVariant={buttonVariant}
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
  initialFileName: PropTypes.string,
  accept: PropTypes.string,
  ariaLabelledBy: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  buttonVariant: PropTypes.string,
};

FileUploadField.defaultProps = {
  onChange: () => {},
  label: null,
  helperText: null,
  textOnButton: null,
  showFileSize: false,
  maxSizeInBytes: null,
  initialFileName: null,
  accept: '*',
  ariaLabelledBy: null,
  ariaDescribedBy: null,
  buttonVariant: 'contained',
};
