/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { JsonEditor as Editor } from '@tupaia/ui-components';

export const JsonEditor = ({ value, onChange, onInvalidChange }) => {
  return (
    <Editor
      value={value}
      onChange={onChange}
      onInvalidChange={onInvalidChange}
      mode="code"
      mainMenuBar={false}
    />
  );
};

JsonEditor.propTypes = {
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  onChange: PropTypes.func.isRequired,
  onInvalidChange: PropTypes.func,
};

JsonEditor.defaultProps = {
  onInvalidChange: () => {},
};
