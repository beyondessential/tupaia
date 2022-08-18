/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { InputField } from './InputField';
import { checkVisibilityCriteriaAreMet } from '../../utilities';

const getJsonFieldValues = value => {
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
};

const DEFAULT_FIELD_TYPE = 'text';

const GreyCard = styled(Card)`
  background: #f9f9f9;
  margin-bottom: 20px;
`;

const Container = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

export const JsonInputField = props => {
  const {
    onChange,
    value,
    getJsonFieldSchema,
    disabled,
    label,
    secondaryLabel,
    variant,
    recordData,
  } = props;
  const jsonFieldValues = getJsonFieldValues(value);
  const jsonFieldSchema = getJsonFieldSchema(value, props);
  const CardVariant = variant === 'grey' ? GreyCard : Card;

  const onFieldValueChange = (fieldName, fieldValue, csv) => {
    const updatedFieldValue = csv ? fieldValue.split(',').map(val => val.trim()) : fieldValue;
    onChange({ ...jsonFieldValues, [fieldName]: updatedFieldValue });
  };

  return (
    <Container>
      <Typography variant="h6" gutterBottom>
        {label}
      </Typography>
      {secondaryLabel && <Typography gutterBottom>{secondaryLabel}</Typography>}
      <CardVariant variant="outlined">
        <CardContent>
          {jsonFieldSchema
            .filter(({ visibilityCriteria }) => {
              if (visibilityCriteria) {
                return checkVisibilityCriteriaAreMet(visibilityCriteria, recordData);
              }
              return true;
            })
            .map(
              ({
                label: fieldLabel,
                fieldName,
                secondaryLabel: fieldSecondaryLabel,
                type = DEFAULT_FIELD_TYPE,
                csv,
                ...inputFieldProps
              }) => (
                <InputField
                  key={fieldName}
                  label={fieldLabel}
                  secondaryLabel={fieldSecondaryLabel}
                  value={jsonFieldValues[fieldName]}
                  inputKey={fieldName}
                  onChange={(inputKey, fieldValue) => onFieldValueChange(inputKey, fieldValue, csv)}
                  disabled={disabled}
                  type={type}
                  {...inputFieldProps}
                />
              ),
            )}
        </CardContent>
      </CardVariant>
    </Container>
  );
};

JsonInputField.propTypes = {
  label: PropTypes.string.isRequired,
  getJsonFieldSchema: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  disabled: PropTypes.bool,
  secondaryLabel: PropTypes.string,
  variant: PropTypes.string,
  recordData: PropTypes.object,
};

JsonInputField.defaultProps = {
  value: {},
  disabled: false,
  secondaryLabel: null,
  variant: null,
  recordData: {},
};
