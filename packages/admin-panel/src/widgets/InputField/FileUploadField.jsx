/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FileUploadField as BaseFileUploadField } from '@tupaia/ui-components';

export const FileUploadField = ({ onChange, name, label, helperText, maxSizeInBytes, accept }) => {
  const handleChange = async files => {
    const [file] = files || [];
    if (!file) {
      onChange({
        fileName: null,
        file: null,
      });
      return;
    }

    onChange({
      fileName: file.name,
      file,
    });
  };

  return (
    <BaseFileUploadField
      onChange={handleChange}
      name={name}
      label={label}
      helperText={helperText}
      maxSizeInBytes={maxSizeInBytes}
      accept={accept}
    />
  );
};

FileUploadField.propTypes = {
  onChange: PropTypes.func,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  helperText: PropTypes.string,
  maxSizeInBytes: PropTypes.number,
  accept: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
};

FileUploadField.defaultProps = {
  onChange: () => {},
  label: null,
  helperText: null,
  maxSizeInBytes: null,
  accept: null,
};
