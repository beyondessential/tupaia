/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { InputField } from '../widgets';

export const Editor = ({ fields, recordData, onEditField }) => (
  <div>
    {fields
      .filter(({ show = true }) => show)
      .map(({ editable = true, editConfig = {}, source, Header, accessor }) => (
        <InputField
          key={source}
          inputKey={source}
          label={Header}
          onChange={onEditField}
          value={accessor ? accessor(recordData) : recordData[source]}
          disabled={!editable}
          {...editConfig}
        />
      ))}
  </div>
);

Editor.propTypes = {
  fields: PropTypes.array.isRequired,
  recordData: PropTypes.object.isRequired,
  onEditField: PropTypes.func.isRequired,
};
