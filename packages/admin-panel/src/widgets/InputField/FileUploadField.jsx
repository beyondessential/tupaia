import React from 'react';
import PropTypes from 'prop-types';
import { FileUploadField as BaseFileUploadField } from '@tupaia/ui-components';

export const FileUploadField = ({
  accept,
  onChange,
  name,
  label,
  helperText,
  fileName,
  maxSizeInBytes,
}) => {
  const handleChange = async files => {
    const [file] = files || [];
    onChange(file ? { fileName: file.name, file } : { fileName: null, file: null });
  };

  return (
    <BaseFileUploadField
      onChange={handleChange}
      name={name}
      fileName={fileName}
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
  fileName: PropTypes.string,
  accept: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
};

FileUploadField.defaultProps = {
  onChange: () => {},
  label: null,
  helperText: null,
  maxSizeInBytes: null,
  fileName: null,
  accept: null,
};
