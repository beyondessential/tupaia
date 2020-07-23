/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { InputField } from '../widgets';

export class Editor extends React.PureComponent {
  onInputChange(inputKey, inputValue, editConfig = {}) {
    const { recordData, onEditField } = this.props;

    const { setFieldsOnChange } = editConfig;
    if (setFieldsOnChange) {
      const newFields = setFieldsOnChange(inputValue, recordData);
      Object.entries(newFields).forEach(([fieldKey, fieldValue]) => {
        onEditField(fieldKey, fieldValue);
      });
    }

    onEditField(inputKey, inputValue);
  }

  render() {
    const { fields, recordData } = this.props;

    return (
      <div>
        {fields
          .filter(({ show = true }) => show)
          .map(({ editable = true, editConfig = {}, source, Header, accessor }) => (
            <InputField
              key={source}
              inputKey={source}
              label={Header}
              onChange={(inputKey, inputValue) =>
                this.onInputChange(inputKey, inputValue, editConfig)
              }
              value={accessor ? accessor(recordData) : recordData[source]}
              recordData={recordData}
              disabled={!editable}
              {...editConfig}
            />
          ))}
      </div>
    );
  }
}

Editor.propTypes = {
  fields: PropTypes.array.isRequired,
  recordData: PropTypes.object.isRequired,
  onEditField: PropTypes.func.isRequired,
};
