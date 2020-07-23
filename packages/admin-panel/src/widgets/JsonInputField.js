/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Card, CardBody } from 'reactstrap';
import { InputField } from './InputField';

const DEFAULT_FIELD_TYPE = 'textarea';

export class JsonInputField extends PureComponent {
  onFieldValueChange(fieldName, fieldValue, csv) {
    const { onChange } = this.props;

    const updatedFieldValue = csv ? fieldValue.split(',').map(value => value.trim()) : fieldValue;

    const jsonFieldValues = this.getJsonFieldValues();
    onChange({ ...jsonFieldValues, [fieldName]: updatedFieldValue });
  }

  getJsonFieldValues() {
    const { value } = this.props;
    if (value) {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (error) {
          // If the field value is not valid json, ignore it.
        }
      } else {
        return value; // Is already a sane js object
      }
    }
    return {};
  }

  render() {
    const { value, getJsonFieldSchema, disabled } = this.props;

    const jsonFieldSchema = getJsonFieldSchema(value, this.props);
    const jsonFieldValues = this.getJsonFieldValues();

    return (
      <FormGroup>
        <Card>
          <CardBody>
            {jsonFieldSchema.map(
              ({ label, fieldName, type = DEFAULT_FIELD_TYPE, csv, ...inputFieldProps }) => (
                <InputField
                  key={fieldName}
                  label={label}
                  value={jsonFieldValues[fieldName]}
                  inputKey={fieldName}
                  onChange={(inputKey, fieldValue) =>
                    this.onFieldValueChange(inputKey, fieldValue, csv)
                  }
                  disabled={disabled}
                  type={type}
                  {...inputFieldProps}
                />
              ),
            )}
          </CardBody>
        </Card>
      </FormGroup>
    );
  }
}

JsonInputField.propTypes = {
  getJsonFieldSchema: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOf([PropTypes.string, PropTypes.object]),
  disabled: PropTypes.bool,
};

JsonInputField.defaultProps = {
  value: {},
  disabled: false,
};
