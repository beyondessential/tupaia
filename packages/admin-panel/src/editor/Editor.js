/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { InputField, JsonEditor } from '../widgets';

export const Editor = props => {
  const { fields, recordData, onEditField } = props;
  return (
    <div>
      {fields
        .filter(({ show = true }) => show)
        .map(({ editable = true, editConfig = {}, source, Header, accessor }) => {
          if (recordData[source] && editConfig.type === 'jsonEditor') {
            return (
              <JsonEditor
                key={source}
                inputKey={source}
                label={Header}
                value={recordData[source]}
                maxHeight={editConfig.maxHeight || 100}
                onChange={onEditField}
              />
            );
          }

          return (
            <InputField
              key={source}
              inputKey={source}
              label={Header}
              onChange={onEditField}
              value={accessor ? accessor(recordData) : recordData[source]}
              disabled={!editable}
              {...editConfig}
            />
          );
        })}
    </div>
  );
};

Editor.propTypes = {
  fields: PropTypes.array.isRequired,
  recordData: PropTypes.object.isRequired,
  onEditField: PropTypes.func.isRequired,
};
